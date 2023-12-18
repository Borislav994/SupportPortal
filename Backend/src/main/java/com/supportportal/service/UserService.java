package com.supportportal.service;

import com.supportportal.domain.UserEntity;
import com.supportportal.exception.domain.*;
import org.springframework.web.multipart.MultipartFile;
import org.w3c.dom.stylesheets.LinkStyle;

import javax.mail.MessagingException;
import java.io.IOException;
import java.util.List;

public interface UserService {

    UserEntity register(String firstName, String lastName, String username, String email) throws UserNotFoundException, EmailExistException, UsernameExistException, MessagingException;
    List<UserEntity> getUsers();
    UserEntity findUserByUsername(String username);
    UserEntity findUserByEmail(String email);
    UserEntity addNewUser(String firstName, String lastName, String username, String email, String role, boolean isNonLocked, boolean isActive, MultipartFile profileImage) throws UserNotFoundException, EmailExistException, UsernameExistException, IOException, NotImageFileException;
    UserEntity updateUser(String currentUsername, String newFirstName, String newLastName, String newUsername,  String newEmail, String role, boolean isNonLocked, boolean isActive, MultipartFile profileImage) throws UserNotFoundException, EmailExistException, UsernameExistException, IOException, NotImageFileException;
    void deleteUser(long id);

    void deleteUserByUserId(String userId) throws IOException;
    void resetPassword(String email) throws EmailNotFoundException, MessagingException;
    UserEntity updateProfileImage(String username, MultipartFile profileImage ) throws UserNotFoundException, EmailExistException, UsernameExistException, IOException, NotImageFileException;
}
