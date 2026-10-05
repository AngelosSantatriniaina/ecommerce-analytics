package mg.shopmada.analytics.repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import mg.shopmada.analytics.domain.OrderStatus;
import mg.shopmada.analytics.domain.SalesOrder;
import mg.shopmada.analytics.repository.projection.CategorySalesView;
import mg.shopmada.analytics.repository.projection.ProductSalesView;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OrderRepository extends JpaRepository<SalesOrder, Long> {
    Page<SalesOrder> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<SalesOrder> findByStatusOrderByCreatedAtDesc(OrderStatus status, Pageable pageable);

    List<SalesOrder> findByCreatedAtGreaterThanEqualAndCreatedAtLessThanOrderByCreatedAtAsc(
            LocalDateTime from, LocalDateTime to);

    long countByCreatedAtGreaterThanEqualAndCreatedAtLessThan(
            LocalDateTime from, LocalDateTime to);

    long countByStatusAndCreatedAtGreaterThanEqualAndCreatedAtLessThan(
            OrderStatus status, LocalDateTime from, LocalDateTime to);

    @Query("select coalesce(sum(o.totalAmount), 0) from SalesOrder o " +
            "where o.createdAt >= :from and o.createdAt < :to " +
            "and o.status not in :excludedStatuses")
    BigDecimal sumRevenue(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to,
                          @Param("excludedStatuses") List<OrderStatus> excludedStatuses);

    @Query("select count(distinct o.customer.id) from SalesOrder o " +
            "where o.createdAt >= :from and o.createdAt < :to " +
            "and o.status not in :excludedStatuses")
    long countActiveCustomers(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to,
                              @Param("excludedStatuses") List<OrderStatus> excludedStatuses);

    @Query("select p.id as productId, p.name as name, p.category as category, " +
            "p.imageUrl as imageUrl, sum(i.quantity) as unitsSold, " +
            "sum(i.quantity * i.unitPrice) as revenue " +
            "from OrderItem i join i.product p join i.order o " +
            "where o.createdAt >= :from and o.createdAt < :to " +
            "and o.status not in :excludedStatuses " +
            "group by p.id, p.name, p.category, p.imageUrl order by sum(i.quantity * i.unitPrice) desc")
    List<ProductSalesView> findTopProducts(@Param("from") LocalDateTime from,
                                           @Param("to") LocalDateTime to,
                                           @Param("excludedStatuses") List<OrderStatus> excludedStatuses,
                                           Pageable pageable);

    @Query("select p.category as category, sum(i.quantity * i.unitPrice) as revenue, " +
            "sum(i.quantity) as unitsSold " +
            "from OrderItem i join i.product p join i.order o " +
            "where o.createdAt >= :from and o.createdAt < :to " +
            "and o.status not in :excludedStatuses " +
            "group by p.category order by sum(i.quantity * i.unitPrice) desc")
    List<CategorySalesView> findSalesByCategory(@Param("from") LocalDateTime from,
                                                @Param("to") LocalDateTime to,
                                                @Param("excludedStatuses") List<OrderStatus> excludedStatuses);
}