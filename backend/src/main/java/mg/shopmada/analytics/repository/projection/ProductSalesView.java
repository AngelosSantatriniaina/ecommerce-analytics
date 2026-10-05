package mg.shopmada.analytics.repository.projection;

import java.math.BigDecimal;

public interface ProductSalesView {
    Long getProductId();
    String getName();
    String getCategory();
    String getImageUrl();
    Long getUnitsSold();
    BigDecimal getRevenue();
}