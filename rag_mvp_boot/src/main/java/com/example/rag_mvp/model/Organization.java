package com.example.rag_mvp.model;

import jakarta.persistence.*;

@Entity
@Table(name = "organizations")
public class Organization {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String orgName;

    @Column(nullable = false,unique = true)
    private String orgEmail;

    private String password;


    public Organization(){}

    public Organization(String orgEmail , String password){
        this.orgEmail = orgEmail;
        this.password = password;
        this.orgEmail = null;
    }

    public Organization(String orgName , String orgEmail , String password){
        this.orgName = orgName;
        this.orgEmail = orgEmail;
        this.password = password;
    }

    public Long getId(){
        return id;
    }

    public String getOrgName() {
        return orgName;
    }

    public void setOrgName(String orgName) {
        this.orgName = orgName;
    }

    public String getOrgEmail() {
        return orgEmail;
    }

    public void setOrgEmail(String orgEmail) {
        this.orgEmail = orgEmail;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

}
