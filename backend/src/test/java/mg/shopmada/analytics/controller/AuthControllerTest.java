package mg.shopmada.analytics.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:auth-flow;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
class AuthControllerTest {
    @Autowired
    private MockMvc mockMvc;

        @Autowired
        private mg.shopmada.analytics.repository.ProductRepository products;

    @Test
    void setupAndLoginCreateAnAuthenticatedSession() throws Exception {
                String csrfToken = requestCsrfToken();
        Cookie csrfCookie = new Cookie("XSRF-TOKEN", csrfToken);

        mockMvc.perform(post("/api/v1/auth/setup")
                        .cookie(csrfCookie)
                        .header("X-XSRF-TOKEN", csrfToken)
                        .contentType("application/json")
                        .content("""
                                {"username":"shop-admin","password":"test-password-with-12-chars","name":"Shop Admin","email":"admin@example.mg"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.username").value("shop-admin"));

        csrfToken = requestCsrfToken();
        csrfCookie = new Cookie("XSRF-TOKEN", csrfToken);

        MvcResult login = mockMvc.perform(post("/api/v1/auth/login")
                        .cookie(csrfCookie)
                        .header("X-XSRF-TOKEN", csrfToken)
                        .contentType("application/json")
                        .content("""
                                {"username":"shop-admin","password":"test-password-with-12-chars"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Shop Admin"))
                .andReturn();

        MockHttpSession session = (MockHttpSession) login.getRequest().getSession(false);
        mockMvc.perform(get("/api/v1/auth/me").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("admin@example.mg"));
    }

    @Test
    void adminDataRequiresAuthenticationButProductsRemainPublic() throws Exception {
        mockMvc.perform(get("/api/v1/dashboard/summary"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/v1/products"))
                .andExpect(status().isOk());
    }

        @Test
        void checkoutIsPublicAndCreatesItsCustomer() throws Exception {
                var product = new mg.shopmada.analytics.domain.Product();
                product.setName("Produit de test checkout");
                product.setCategory("Test");
                product.setUnitPrice(new java.math.BigDecimal("12000.00"));
                product.setStockQuantity(5);
                product = products.saveAndFlush(product);
                String csrfToken = requestCsrfToken();

                mockMvc.perform(post("/api/v1/checkout")
                                                .cookie(new Cookie("XSRF-TOKEN", csrfToken))
                                                .header("X-XSRF-TOKEN", csrfToken)
                                                .contentType("application/json")
                                                .content("""
                                                                {"customer":{"name":"Client Checkout","email":"checkout@example.mg"},"items":[{"productId":%d,"quantity":1}],"paymentMethod":"Paiement à la livraison"}
                                                                """.formatted(product.getId())))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.customerName").value("Client Checkout"));
        }

        private String requestCsrfToken() throws Exception {
        MvcResult result = mockMvc.perform(get("/api/v1/auth/csrf"))
                .andExpect(status().isOk())
                .andReturn();
        String json = result.getResponse().getContentAsString();
        return json.substring(json.indexOf(":\"") + 2, json.lastIndexOf('"'));
    }
}