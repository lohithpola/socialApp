package com.app.socialmedia.exception;

public class LikeNotFoundException extends RuntimeException{
    public LikeNotFoundException(String message){
        super(message);
    }
}
