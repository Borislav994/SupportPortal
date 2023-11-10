package com.supportportal.service;

import com.supportportal.domain.UserEntity;
import com.supportportal.exception.domain.EmailExistException;
import com.supportportal.exception.domain.UserNotFoundException;
import com.supportportal.exception.domain.UsernameExistException;
import org.w3c.dom.stylesheets.LinkStyle;

import java.util.List;

public interface UserService {

    UserEntity register(String firstName, String lastName, String username, String email) throws UserNotFoundException, EmailExistException, UsernameExistException;
    List<UserEntity> getUsers();
    UserEntity findUserByUsername(String username);
    UserEntity findUserByEmail(String email);
}
