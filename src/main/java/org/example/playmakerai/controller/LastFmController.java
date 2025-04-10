package org.example.playmakerai.controller;

import org.example.playmakerai.service.LastFmService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/lastfm")
public class LastFmController {

    @Autowired
    private LastFmService lastFmService;

    @GetMapping("/top-artists")
    public ResponseEntity<Map<String, Object>> getTopArtists(@RequestParam(defaultValue = "10") int limit) {
        Map<String, Object> result = lastFmService.getTopArtists(limit);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/artist-info")
    public ResponseEntity<Map<String, Object>> getArtistInfo(@RequestParam String artist) {
        Map<String, Object> result = lastFmService.getArtistInfo(artist);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/search-track")
    public ResponseEntity<Map<String, Object>> searchTrack(
            @RequestParam String artist,
            @RequestParam String track) {
        Map<String, Object> result = lastFmService.searchTrack(artist, track);
        return ResponseEntity.ok(result);
    }
}