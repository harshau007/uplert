package com.github.uplert.config;

import com.github.uplert.websocket.CustomHandshakeHandler;
import com.github.uplert.websocket.LogHandler;
import com.github.uplert.websocket.WebSocketHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {
    private final WebSocketHandler webSocketHandler;
    private final LogHandler logHandler;

    public WebSocketConfig(WebSocketHandler webSocketHandler, LogHandler logHandler) {
        this.webSocketHandler = webSocketHandler;
        this.logHandler = logHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(logHandler, "/ws/{projectId}/log").setAllowedOrigins("*").setHandshakeHandler(new CustomHandshakeHandler());
        registry.addHandler(webSocketHandler, "/ws").setAllowedOrigins("*");
    }
}
