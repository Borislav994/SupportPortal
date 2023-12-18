package com.supportportal.repository;

import com.supportportal.domain.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<UserEntity, Long> {

    UserEntity findUserByUsername(String username);
    UserEntity findUserByEmail(String email);

    UserEntity findUserByUserId(String userId);
}
