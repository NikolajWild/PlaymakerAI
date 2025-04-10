package org.example.playmakerai.service;
import org.example.playmakerai.dto.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class MistralService {

    private final WebClient webClient;

    @Autowired
    public MistralService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl("https://api.mistral.ai/v1/chat/completions").build();
    }

    @Value("${openai.api.key}")
    private String openapikey;

    @Value("${lastfm.api.key}")
    private String lastFMApiKey;

    public Map<String, Object> promptMistral(String userPrompt) {

        RequestDTO requestDTO = new RequestDTO();
        requestDTO.setModel("mistral-small-latest");
        requestDTO.setTemperature(0.7);
        requestDTO.setMaxTokens(300);

        List<Message> lstMessages = new ArrayList<>();
        lstMessages.add(new Message("system", "You are a helpful playlist maker. The user will provide an artist and a song name. " +
                "Your task is to generate a playlist with exactly 10 songs that match the style of the user's input. " +
                "The playlist should be similar in genre, vibe, language or mood. " +
                "Respond with a numbered list of exactly 10 songs, including both the artist and song title for each item."));
        lstMessages.add(new Message("user", userPrompt));
        requestDTO.setMessages(lstMessages);

        ResponseDTO response = webClient.post()
                .contentType(MediaType.APPLICATION_JSON)
                .headers(h -> h.setBearerAuth(openapikey))
                .bodyValue(requestDTO)
                .retrieve()
                .bodyToMono(ResponseDTO.class)
                .block();

        List<Choice> lst = response.getChoices();
        String content = lst.get(0).getMessage().getContent();

        Map<String, Object> map = new HashMap<>();
        map.put("answer", content);

        return map;


    }
}