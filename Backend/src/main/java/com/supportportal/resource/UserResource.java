package com.supportportal.resource;

import com.supportportal.domain.HttpResponse;
import com.supportportal.domain.UserEntity;
import com.supportportal.exception.ExceptionHandling;
import com.supportportal.exception.domain.EmailExistException;
import com.supportportal.exception.domain.UserNotFoundException;
import com.supportportal.exception.domain.UsernameExistException;
import com.supportportal.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;

import static org.springframework.http.HttpStatus.*;

@RestController
@RequestMapping(path = {"/" , "/user"})
public class UserResource extends ExceptionHandling {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<UserEntity> register(@RequestBody UserEntity user) throws UserNotFoundException, EmailExistException, UsernameExistException {
        UserEntity newUser = userService.register(user.getFirstName(), user.getLastName(), user.getUsername(), user.getEmail());
        return new ResponseEntity<>(newUser, HttpStatus.OK);
    }

    @PostMapping("/login")
    public ResponseEntity<UserEntity> register(@RequestBody UserEntity user) throws UserNotFoundException, EmailExistException, UsernameExistException {
        authenticate(user.getUsername(), user.getPassword());
        UserEntity loginUser = userService.findUserByUsername(user.getUsername());
        return new ResponseEntity<>(newUser, HttpStatus.OK);
    }

    private void authenticate(String username, String password) {

    }
}
