package io.chumahumphrey.qagen.qagenbackend.user;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
public class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    public void shouldSaveAndFindByEmail(){

        // Arrange: Create a brand-new user
        User newUser = new User();
        newUser.setEmail("test@gmail.com");
        newUser.setPasswordHash("superSecretHash1234");
        newUser.setRole("USER");

        // Act: Tell the repository to save it, and then find it by email
        User savedUser = userRepository.save(newUser);
        Optional<User> foundUser = userRepository.findByEmail(savedUser.getEmail());

        // Assert: Verify that the repository translated and store our data
        assertThat(foundUser).isPresent();
        assertThat(foundUser.get().getEmail()).isEqualTo("test@gmail.com");
        assertThat(foundUser.get().getId()).isNotNull();

    }

}
