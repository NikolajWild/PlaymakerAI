package org.example.playmakerai.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.HashMap;
import java.util.Map;

@Service
public class LastFmService {

    private final WebClient webClient;

    @Value("${lastfm.api.key}")
    private String lastFmApiKey;

    @Autowired
    public LastFmService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl("https://ws.audioscrobbler.com/2.0/").build();
    }

    public Map<String, Object> getTopArtists(int limit) {
        String uri = UriComponentsBuilder.fromPath("")
                .queryParam("method", "chart.gettopartists")
                .queryParam("api_key", lastFmApiKey)
                .queryParam("format", "json")
                .queryParam("limit", limit)
                .build()
                .toUriString();

        Map<String, Object> response = webClient.get()
                .uri(uri)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        return response;
    }

    public Map<String, Object> getArtistInfo(String artist) {
        String uri = UriComponentsBuilder.fromPath("")
                .queryParam("method", "artist.getinfo")
                .queryParam("artist", artist)
                .queryParam("api_key", lastFmApiKey)
                .queryParam("format", "json")
                .build()
                .toUriString();

        Map<String, Object> response = webClient.get()
                .uri(uri)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        return response;
    }

    public Map<String, Object> searchTrack(String artist, String track) {
        String uri = UriComponentsBuilder.fromPath("")
                .queryParam("method", "track.search")
                .queryParam("track", track)
                .queryParam("artist", artist)
                .queryParam("api_key", lastFmApiKey)
                .queryParam("format", "json")
                .build()
                .toUriString();

        Map<String, Object> response = webClient.get()
                .uri(uri)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        return response;
    }
}