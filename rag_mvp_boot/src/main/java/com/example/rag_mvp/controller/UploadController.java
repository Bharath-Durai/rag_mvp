package com.example.rag_mvp.controller;


import com.example.rag_mvp.util.MultipartInputStreamFileResource;
import org.jetbrains.annotations.NotNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/files")
public class UploadController {

    private static final Logger log = LoggerFactory.getLogger(UploadController.class);
    @Value("${fast_api_base_url}")
    private String FAST_API_URL;

    @PostMapping("/upload")
    public ResponseEntity<?> handleUploadAndForward(@NotNull @RequestParam("file") MultipartFile file , @RequestParam("orgID") String orgID){
        try{
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String,Object> body = new LinkedMultiValueMap<>();

            body.add("file", new MultipartInputStreamFileResource(file.getInputStream() , file.getOriginalFilename()));
            body.add("orgID",orgID);

            HttpEntity<MultiValueMap<String,Object>> requestEntity = new HttpEntity<>(body,headers);
            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<Map> response = restTemplate.postForEntity(FAST_API_URL+"/upload",requestEntity,Map.class);
            return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
        }catch (Exception e){
            log.info(e.toString());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error forwarding file: " + e.getMessage());
        }
    }
}
