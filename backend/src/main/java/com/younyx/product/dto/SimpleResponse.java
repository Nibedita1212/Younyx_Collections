package com.younyx.product.dto;
public class SimpleResponse {
  private boolean ok;
  private String message;
  public SimpleResponse(){}
  public SimpleResponse(boolean ok, String msg){ this.ok = ok; this.message = msg; }
  public boolean isOk(){return ok;} public String getMessage(){return message;}
  public void setOk(boolean o){this.ok=o;} public void setMessage(String m){this.message=m;}
}
