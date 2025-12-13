package com.younyx.order.entity;

public enum OrderStatus {
    PENDING,      // order place hua, payment confirm nahi
    PROCESSING,   // payment OK, packing / ready
    PAID,         // payment received (COD ko deliver ke baad PAID kar sakte)
    SHIPPED,      // courier ko handover
    DELIVERED,    // customer ko mil gaya
    CANCELLED     // cancel / failed
}
