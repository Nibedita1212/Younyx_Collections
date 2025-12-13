package com.younyx.product.dto;

import com.younyx.product.entity.CartItem;
import com.younyx.product.entity.Product;

import java.lang.reflect.Array;
import java.lang.reflect.Method;
import java.math.BigDecimal;
import java.util.Collection;

/**
 * Defensive DTO: probes Product for common image/category getters using reflection
 * so we don't fail compile if your Product uses slightly different field/getter names.
 */
public class CartItemResponse {
  public Long id;
  public Long productId;
  public String name;
  public Double price;
  public Integer qty;
  public String mainImageUrl;
  public String description;
  public String category;

  public static CartItemResponse from(CartItem ci) {
    CartItemResponse r = new CartItemResponse();
    r.id = ci.getId();
    Product p = ci.getProduct();
    if (p != null) {
      r.productId = safeGetLong(p, new String[] { "getId", "getProductId", "getIdLong" });
      r.name = safeGetString(p, new String[] { "getName", "getTitle", "getProductName" });

      // price: support BigDecimal or Number
      Object priceObj = safeInvoke(p, new String[] { "getPrice", "price", "getCost" });
      if (priceObj instanceof BigDecimal) {
        r.price = ((BigDecimal) priceObj).doubleValue();
      } else if (priceObj instanceof Number) {
        r.price = ((Number) priceObj).doubleValue();
      } else {
        r.price = 0.0;
      }

      // images: try multiple getter names and handle List/Collection/Array/String
      Object imgObj = safeInvoke(p, new String[] { "getMainImageUrl", "getImageUrl", "getImage", "getImages", "images", "getPhotos" });
      r.mainImageUrl = extractFirstStringFromObject(imgObj);

      r.description = safeGetString(p, new String[] { "getDescription", "getDesc", "description" });

      // category: try getters; if category object returned, try to get its name
      Object catObj = safeInvoke(p, new String[] { "getCategoryName", "getCategory", "getCategoryTitle", "getCat", "category" });
      if (catObj != null) {
        if (catObj instanceof String) {
          r.category = (String) catObj;
        } else {
          // try to read name from category object via reflection
          r.category = safeGetString(catObj, new String[] { "getName", "getTitle", "name", "title" });
        }
      } else {
        r.category = null;
      }
    }
    r.qty = ci.getQty();
    return r;
  }

  // ----------------- helpers -----------------

  private static Object safeInvoke(Object target, String[] methodNames) {
    if (target == null) return null;
    Class<?> cls = target.getClass();
    for (String mname : methodNames) {
      try {
        Method m = cls.getMethod(mname);
        if (m != null) {
          try {
            return m.invoke(target);
          } catch (Exception ignored) { /* try next */ }
        }
      } catch (NoSuchMethodException ignored) {
        // try next name
      }
    }
    return null;
  }

  private static String safeGetString(Object target, String[] methodNames) {
    Object o = safeInvoke(target, methodNames);
    if (o == null) return null;
    return extractFirstStringFromObject(o);
  }

  private static Long safeGetLong(Object target, String[] methodNames) {
    Object o = safeInvoke(target, methodNames);
    if (o == null) return null;
    if (o instanceof Number) return ((Number) o).longValue();
    try {
      return Long.parseLong(o.toString());
    } catch (Exception e) {
      return null;
    }
  }

  private static String extractFirstStringFromObject(Object o) {
    if (o == null) return null;
    if (o instanceof String) {
      String s = ((String) o).trim();
      return s.isEmpty() ? null : s;
    }
    if (o instanceof Collection) {
      Collection<?> c = (Collection<?>) o;
      if (!c.isEmpty()) return extractFirstStringFromObject(c.iterator().next());
      return null;
    }
    if (o.getClass().isArray()) {
      int len = Array.getLength(o);
      if (len > 0) return extractFirstStringFromObject(Array.get(o, 0));
      return null;
    }
    // fallback: use toString()
    String s = o.toString();
    return s == null || s.trim().isEmpty() ? null : s;
  }
}
