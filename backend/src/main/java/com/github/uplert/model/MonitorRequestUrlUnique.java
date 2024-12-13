package com.github.uplert.model;

import static java.lang.annotation.ElementType.ANNOTATION_TYPE;
import static java.lang.annotation.ElementType.FIELD;
import static java.lang.annotation.ElementType.METHOD;

import com.github.uplert.service.MonitorRequestService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Constraint;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import jakarta.validation.Payload;
import java.lang.annotation.Documented;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.util.Map;
import org.springframework.web.servlet.HandlerMapping;


/**
 * Validate that the url value isn't taken yet.
 */
@Target({ FIELD, METHOD, ANNOTATION_TYPE })
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Constraint(
        validatedBy = MonitorRequestUrlUnique.MonitorRequestUrlUniqueValidator.class
)
public @interface MonitorRequestUrlUnique {

    String message() default "{Exists.monitorRequest.url}";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};

    class MonitorRequestUrlUniqueValidator implements ConstraintValidator<MonitorRequestUrlUnique, String> {

        private final MonitorRequestService monitorRequestService;
        private final HttpServletRequest request;

        public MonitorRequestUrlUniqueValidator(final MonitorRequestService monitorRequestService,
                final HttpServletRequest request) {
            this.monitorRequestService = monitorRequestService;
            this.request = request;
        }

        @Override
        public boolean isValid(final String value, final ConstraintValidatorContext cvContext) {
            if (value == null) {
                // no value present
                return true;
            }
            @SuppressWarnings("unchecked") final Map<String, String> pathVariables =
                    ((Map<String, String>)request.getAttribute(HandlerMapping.URI_TEMPLATE_VARIABLES_ATTRIBUTE));
            final String currentId = pathVariables.get("requestId");
            if (currentId != null && value.equalsIgnoreCase(monitorRequestService.get(currentId).getUrl())) {
                // value hasn't changed
                return true;
            }
            return !monitorRequestService.urlExists(value);
        }

    }

}
