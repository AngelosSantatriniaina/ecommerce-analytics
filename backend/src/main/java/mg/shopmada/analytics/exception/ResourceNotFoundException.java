package mg.shopmada.analytics.exception;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String resource, Object id) {
        super(resource + " introuvable : " + id);
    }
}