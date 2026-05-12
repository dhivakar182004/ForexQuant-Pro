package com.forexquant;

import com.forexquant.model.User;
import com.forexquant.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

	@Bean
	public CommandLineRunner initDatabase(UserRepository userRepository) {
		return args -> {
			String defaultEmail = "diagnostic_test_user@example.com";
			if (userRepository.findByEmail(defaultEmail).isEmpty()) {
				User user = new User();
				user.setName("Diagnostic User");
				user.setEmail(defaultEmail);
				user.setPassword("Password123!");
				user.setPhoneNumber("+19998887770");
				user.setTotpEnabled(false);
				userRepository.save(user);
				System.out.println("[DATABASE SEED] Pre-registered default diagnostic user: diagnostic_test_user@example.com / Password123!");
			}
		};
	}
}
