package com.example.rag_mvp.controller;


import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.jetbrains.annotations.NotNull;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

@RestController
@RequestMapping("/api/stream")
public class StreamController {

    private static final Log log = LogFactory.getLog(StreamController.class);
    @Value("${fast_api_base_url}")
    private String FAST_API_URL;


    @RequestMapping(value = "/generate",method = RequestMethod.GET)
    public SseEmitter streamFromFastAPI(@NotNull @RequestParam String id , @RequestParam String query){
        SseEmitter emitter = new SseEmitter(0L);

        new Thread(()->{
            try{
                URL url = new URL(FAST_API_URL+"proxy_llm_strem");
                HttpURLConnection connection = (HttpURLConnection) url.openConnection();
                connection.setRequestMethod("POST");
                connection.setDoOutput(true);
                connection.setRequestProperty("Content-type","application/json");
                connection.setRequestProperty("Accept","text/event-stream");

                String payload = String.format(
                        """
                        {
                            "id" : "%s",
                            "query" : "%s"
                        }
                        """,
                        id,query
                );

                connection.getOutputStream().write(payload.getBytes());
                connection.getOutputStream().flush();

                BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream()));
                String line;
                while((line = reader.readLine()) != null){
                    if(!line.isEmpty()){
                        emitter.send(SseEmitter.event().data(line));
                    }
                }
                emitter.complete();
            }catch (Exception e){
                emitter.completeWithError(e);
                e.printStackTrace();
            }
        }).start();
        return emitter;
    }

}
