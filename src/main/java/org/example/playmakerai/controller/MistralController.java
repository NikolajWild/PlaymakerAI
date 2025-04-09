package org.example.playmakerai.controller;

import org.example.playmakerai.service.MistralService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class MistralController {

    @Autowired
    MistralService mistralService;

    @Value("${openai.api.key}")
    private String openapikey;

    @GetMapping("/key")
    public String key() {
        return openapikey;
    }

    @GetMapping("/test")
    public Map<String, Object> test() {
        Map<String, Object> testmap = mistralService.promptMistral();
        return testmap;
    }


}
