package com.younyx.product.dto;
public class CartAddRequest {
  private Long productId;
  private Integer qty = 1;
  public Long getProductId(){return productId;}
  public void setProductId(Long id){this.productId = id;}
  public Integer getQty(){return qty;}
  public void setQty(Integer q){this.qty = q;}
}
   