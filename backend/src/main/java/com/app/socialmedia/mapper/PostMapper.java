package com.app.socialmedia.mapper;

import com.app.socialmedia.dto.PostDto;
import com.app.socialmedia.model.Post;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface PostMapper {
    PostMapper INSTANCE= Mappers.getMapper(PostMapper.class);

    PostDto postToPostDto(Post post);
}
