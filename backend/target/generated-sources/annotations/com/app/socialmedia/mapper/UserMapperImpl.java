package com.app.socialmedia.mapper;

import com.app.socialmedia.dto.LoginRequestDTO;
import com.app.socialmedia.dto.UserDto;
import com.app.socialmedia.model.Users;
import java.util.Arrays;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-04-18T22:50:04+0530",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 17.0.12 (Oracle Corporation)"
)
@Component
public class UserMapperImpl implements UserMapper {

    @Override
    public UserDto toUserDto(Users user) {
        if ( user == null ) {
            return null;
        }

        UserDto userDto = new UserDto();

        userDto.setId( user.getId() );
        userDto.setUserName( user.getUserName() );
        byte[] imageData = user.getImageData();
        if ( imageData != null ) {
            userDto.setImageData( Arrays.copyOf( imageData, imageData.length ) );
        }

        return userDto;
    }

    @Override
    public Users loginDTOToUser(LoginRequestDTO dto) {
        if ( dto == null ) {
            return null;
        }

        Users users = new Users();

        users.setUserName( dto.getUserName() );
        users.setPassword( dto.getPassword() );

        return users;
    }
}
