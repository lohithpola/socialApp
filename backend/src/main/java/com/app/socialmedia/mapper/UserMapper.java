package com.app.socialmedia.mapper;

import com.app.socialmedia.dto.LoginRequestDTO;
import com.app.socialmedia.dto.UserDto;
import com.app.socialmedia.model.Users;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {

    UserDto toUserDto(Users user);

    Users loginDTOToUser(LoginRequestDTO dto);
}
