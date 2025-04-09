package org.example.playmakerai.controller;

import org.example.playmakerai.service.MistralService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/songs")
public class MistralController {

    @Autowired
    MistralService mistralService;

    @Value("${openai.api.key}")
    private String openapikey;

   /* @GetMapping("/key")
    public String key() {
        return openapikey;
    }

    @GetMapping("/test")
    public Map<String, Object> test(@RequestParam String userPrompt) {
        Map<String, Object> testmap = mistralService.promptMistral(userPrompt);
        return testmap;
    }*/

    @GetMapping("")
    public ResponseEntity<Map<String, Object>> getRecommendationsWithArtists(@RequestParam String artists) {
        Map<String, Object> result = mistralService.promptMistral(artists);
        return ResponseEntity.ok(result);
    }


}
