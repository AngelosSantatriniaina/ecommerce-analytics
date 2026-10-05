package mg.shopmada.analytics.repository.projection;

import java.math.BigDecimal;

public interface CategorySalesView {
    String getCategory();
    BigDecimal getRevenue();
    Long getUnitsSold();
}