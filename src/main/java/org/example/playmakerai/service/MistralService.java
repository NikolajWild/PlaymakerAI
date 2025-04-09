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

    public Map<String, Object> promptMistral(String userPrompt) {

        RequestDTO requestDTO = new RequestDTO();
        requestDTO.setModel("mistral-small-latest");
        requestDTO.setTemperature(1.0);
        requestDTO.setMaxTokens(200);

        List<Message> lstMessages = new ArrayList<>();
        lstMessages.add(new Message("system", "You are a helpful playlist maker, and will help the user make a playlist with songs that match the users input, the user will input an artist and a song name" +
                " the result must match the style of music with the users input, and have between 5-10 songs"));
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