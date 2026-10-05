package mg.shopmada.analytics.controller;

import jakarta.validation.Valid;
import mg.shopmada.analytics.dto.ApiDtos.ProductRequest;
import mg.shopmada.analytics.dto.ApiDtos.ProductResponse;
import mg.shopmada.analytics.service.ProductService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/products")
public class ProductController {
    private final ProductService service;

    public ProductController(ProductService service) { this.service = service; }

    @GetMapping
    public Page<ProductResponse> list(@RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100),
                Sort.by("name").ascending());
        return service.list(search, pageable);
    }

    @GetMapping("/{id}")
    public ProductResponse get(@PathVariable long id) { return service.get(id); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductResponse create(@Valid @RequestBody ProductRequest request) { return service.create(request); }

    @PutMapping("/{id}")
    public ProductResponse update(@PathVariable long id, @Valid @RequestBody ProductRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable long id) { service.delete(id); }
}