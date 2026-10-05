package mg.shopmada.analytics.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import mg.shopmada.analytics.dto.ApiDtos.AdminLoginRequest;
import mg.shopmada.analytics.dto.ApiDtos.AdminProfileRequest;
import mg.shopmada.analytics.dto.ApiDtos.AdminResponse;
import mg.shopmada.analytics.dto.ApiDtos.AdminSetupRequest;
import mg.shopmada.analytics.dto.ApiDtos.AuthStatusResponse;
import mg.shopmada.analytics.dto.ApiDtos.ChangePasswordRequest;
import mg.shopmada.analytics.dto.ApiDtos.CsrfResponse;
import mg.shopmada.analytics.service.AdminAccountService;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private final AdminAccountService accounts;
    private final AuthenticationManager authenticationManager;
    private final SecurityContextRepository contextRepository;

    public AuthController(AdminAccountService accounts, AuthenticationManager authenticationManager,
            SecurityContextRepository contextRepository) {
        this.accounts = accounts;
        this.authenticationManager = authenticationManager;
        this.contextRepository = contextRepository;
    }

    @GetMapping("/status")
    public AuthStatusResponse status() {
        return new AuthStatusResponse(accounts.setupRequired());
    }

    @GetMapping("/csrf")
    public CsrfResponse csrf(CsrfToken token) {
        return new CsrfResponse(token.getToken());
    }

    @PostMapping("/setup")
    @ResponseStatus(HttpStatus.CREATED)
    public AdminResponse setup(@Valid @RequestBody AdminSetupRequest request) {
        return accounts.setup(request);
    }

    @PostMapping("/login")
    public AdminResponse login(@Valid @RequestBody AdminLoginRequest request,
            HttpServletRequest servletRequest, HttpServletResponse response) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    UsernamePasswordAuthenticationToken.unauthenticated(request.username(), request.password()));
                if (servletRequest.getSession(false) != null) servletRequest.changeSessionId();
            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(authentication);
            SecurityContextHolder.setContext(context);
            contextRepository.saveContext(context, servletRequest, response);
            return accounts.profile(authentication.getName());
        } catch (BadCredentialsException exception) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Identifiants incorrects.");
        }
    }

    @GetMapping("/me")
    public AdminResponse me(Authentication authentication) {
        return accounts.profile(authentication.getName());
    }

    @PutMapping("/profile")
    public AdminResponse updateProfile(Authentication authentication,
            @Valid @RequestBody AdminProfileRequest request) {
        return accounts.updateProfile(authentication.getName(), request);
    }

    @PostMapping("/password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void changePassword(Authentication authentication, @Valid @RequestBody ChangePasswordRequest request) {
        accounts.changePassword(authentication.getName(), request);
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(Authentication authentication, HttpServletRequest request, HttpServletResponse response) {
        new SecurityContextLogoutHandler().logout(request, response, authentication);
    }
}