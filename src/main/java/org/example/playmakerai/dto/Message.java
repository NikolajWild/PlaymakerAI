package org.example.playmakerai.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

import javax.annotation.processing.Generated;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({
        "role",
        "tool_calls",
        "content"
})
@Generated("jsonschema2pojo")
public class Message {

    @JsonProperty("role")
    private String role;
    @JsonProperty("tool_calls")
    private Object toolCalls;
    @JsonProperty("content")
    private String content;

    public Message(String role, String content) {
        this.role = role;
        this.content = content;
    }

    @JsonProperty("role")
    public String getRole() {
        return role;
    }

    @JsonProperty("role")
    public void setRole(String role) {
        this.role = role;
    }

    @JsonProperty("tool_calls")
    public Object getToolCalls() {
        return toolCalls;
    }

    @JsonProperty("tool_calls")
    public void setToolCalls(Object toolCalls) {
        this.toolCalls = toolCalls;
    }

    @JsonProperty("content")
    public String getContent() {
        return content;
    }

    @JsonProperty("content")
    public void setContent(String content) {
        this.content = content;
    }


}
