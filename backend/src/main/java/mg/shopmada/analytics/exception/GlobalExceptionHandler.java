package mg.shopmada.analytics.exception;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.stream.Collectors;
import mg.shopmada.analytics.dto.ApiDtos.ApiError;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ResourceNotFoundException.class)
    ResponseEntity<ApiError> handleNotFound(ResourceNotFoundException exception, HttpServletRequest request) {
        return error(HttpStatus.NOT_FOUND, exception.getMessage(), request);
    }

    @ExceptionHandler({IllegalArgumentException.class, IllegalStateException.class})
    ResponseEntity<ApiError> handleConflict(RuntimeException exception, HttpServletRequest request) {
        return error(HttpStatus.CONFLICT, exception.getMessage(), request);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    ResponseEntity<ApiError> handleConstraint(DataIntegrityViolationException exception, HttpServletRequest request) {
        return error(HttpStatus.CONFLICT, "Cette opération entre en conflit avec des données existantes.", request);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException exception, HttpServletRequest request) {
        String message = exception.getBindingResult().getFieldErrors().stream()
                .map(field -> field.getField() + " : " + field.getDefaultMessage())
                .collect(Collectors.joining("; "));
        return error(HttpStatus.BAD_REQUEST, message, request);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    ResponseEntity<ApiError> handleUnreadable(HttpMessageNotReadableException exception, HttpServletRequest request) {
        return error(HttpStatus.BAD_REQUEST, "Le corps de la requête est invalide.", request);
    }

    private ResponseEntity<ApiError> error(HttpStatus status, String message, HttpServletRequest request) {
        return ResponseEntity.status(status).body(new ApiError(
                LocalDateTime.now(), status.value(), status.getReasonPhrase(), message, request.getRequestURI()));
    }
}