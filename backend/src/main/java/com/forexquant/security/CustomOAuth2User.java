package com.forexquant.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;
import com.forexquant.model.User;
import java.util.Collection;
import java.util.Map;

public class CustomOAuth2User implements OAuth2User {
    private OAuth2User oauth2User;
    private User internalUser;

    public CustomOAuth2User(OAuth2User oauth2User, User internalUser) {
        this.oauth2User = oauth2User;
        this.internalUser = internalUser;
    }

    public User getInternalUser() {
        return internalUser;
    }

    @Override
    public Map<String, Object> getAttributes() { return oauth2User.getAttributes(); }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() { return oauth2User.getAuthorities(); }

    @Override
    public String getName() { return oauth2User.getAttribute("name"); }
}
