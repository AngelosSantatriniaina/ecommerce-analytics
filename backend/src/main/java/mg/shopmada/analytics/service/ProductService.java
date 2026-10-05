package mg.shopmada.analytics.service;

import mg.shopmada.analytics.domain.Product;
import mg.shopmada.analytics.dto.ApiDtos.ProductRequest;
import mg.shopmada.analytics.dto.ApiDtos.ProductResponse;
import mg.shopmada.analytics.exception.ResourceNotFoundException;
import mg.shopmada.analytics.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ProductService {
    private final ProductRepository products;

    public ProductService(ProductRepository products) {
        this.products = products;
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> list(String search, Pageable pageable) {
        Page<Product> page = search == null || search.isBlank()
            ? products.findByActiveTrue(pageable)
            : products.findByActiveTrueAndNameContainingIgnoreCaseOrActiveTrueAndCategoryContainingIgnoreCase(
                search.trim(), search.trim(), pageable);
        return page.map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public ProductResponse get(long id) {
        return toResponse(find(id));
    }

    public ProductResponse create(ProductRequest request) {
        if (products.existsByNameIgnoreCaseAndActiveTrue(request.name())) {
            throw new IllegalArgumentException("Un produit portant ce nom existe déjà.");
        }
        return toResponse(apply(new Product(), request));
    }

    public ProductResponse update(long id, ProductRequest request) {
        Product product = find(id);
        if (!product.getName().equalsIgnoreCase(request.name())
            && products.existsByNameIgnoreCaseAndActiveTrue(request.name())) {
            throw new IllegalArgumentException("Un produit portant ce nom existe déjà.");
        }
        return toResponse(apply(product, request));
    }

    public void delete(long id) {
        Product product = find(id);
        product.setActive(false);
        products.save(product);
    }

    private Product find(long id) {
        return products.findByIdAndActiveTrue(id)
            .orElseThrow(() -> new ResourceNotFoundException("Produit", id));
    }

    private Product apply(Product product, ProductRequest request) {
        product.setName(request.name().trim());
        product.setCategory(request.category().trim());
        product.setUnitPrice(request.unitPrice());
        product.setStockQuantity(request.stockQuantity());
        product.setImageUrl(request.imageUrl());
        return products.save(product);
    }

    private ProductResponse toResponse(Product product) {
        return new ProductResponse(product.getId(), product.getName(), product.getCategory(),
                product.getUnitPrice(), product.getStockQuantity(), product.getImageUrl(), product.getUpdatedAt());
    }
}