package com.forexquant.security;

import com.forexquant.security.jwt.JwtUtils;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Autowired
    private JwtUtils jwtUtils;

    @org.springframework.beans.factory.annotation.Value("${forexquant.frontend.url:http://localhost:5173}")
    private String frontendBaseUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        
        CustomOAuth2User oAuth2User = (CustomOAuth2User) authentication.getPrincipal();
        
        boolean requiresTotp = oAuth2User.getInternalUser().isTotpEnabled();
        String token = jwtUtils.generateJwtTokenFromEmail(oAuth2User.getInternalUser().getEmail(), !requiresTotp);
        
        String targetRoute = requiresTotp ? "/otp-verification" : "/dashboard";
        
        // Use dynamically configured frontend URL for production environments
        String frontendUrl = frontendBaseUrl + targetRoute + "?token=" + token;
        getRedirectStrategy().sendRedirect(request, response, frontendUrl);
    }
}
