package com.example.rag_mvp.controller;

import com.example.rag_mvp.model.Organization;
import com.example.rag_mvp.repository.OrgRepository;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.jetbrains.annotations.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.graphql.GraphQlProperties;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private static final Log log = LogFactory.getLog(AuthController.class);
    @Autowired
    private OrgRepository orgRepository;

    @Autowired
    @Qualifier("passwordEncoder")
    private BCryptPasswordEncoder passwordEncoder;

    @Qualifier("authenticationManager")
    private AuthenticationManager authenticationManager;


    @PostMapping("/signup")
    public ResponseEntity<?> register(@NotNull @RequestBody Organization organization){
        HashMap<String,Object> response = new HashMap<>();

        try{
            Optional<Organization> existing = orgRepository.findByOrgEmail(organization.getOrgEmail());
            if(existing.isPresent()){
                response.put("status",false);
                response.put("message" , "Email already exists");
                return ResponseEntity.status(HttpStatus.OK).body(response);
            }


            organization.setPassword(passwordEncoder.encode(organization.getPassword()));
            orgRepository.save(organization);
            response.put("status",true);
            response.put("orgID" , organization.getId());
            response.put("message","Account Registered Successfully");
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception e) {
            response.put("status" , false);
            response.put("message" , e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }

    }

    @PostMapping("/signin")
    public ResponseEntity<?> login(@NotNull @RequestBody Organization loginRequest){
        HashMap<String,Object> response = new HashMap<>();
        try{
            Optional<Organization> org = orgRepository.findByOrgEmail(loginRequest.getOrgEmail());
            response.put("status",true);
            if(org.isEmpty() || !passwordEncoder.matches(loginRequest.getPassword(),org.get().getPassword())){
                response.put("status",false);
                response.put("message" , "Invalid Email or password!");
                return ResponseEntity.status(HttpStatus.OK).body(response);
            }
            response.put("orgID",org.get().getId());
            response.put("message" , "Login Successfully");

            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception e) {
            response.put("status" , false);
            response.put("message" , e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }


    }
}
