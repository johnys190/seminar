package com.vetx.starter.repository;

import com.vetx.starter.model.Trainee;
import com.vetx.starter.model.auth.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.List;
import java.util.Optional;

@Repository
@CrossOrigin
@PreAuthorize("hasAnyRole('ROLE_USER', 'ROLE_ADMIN')")
public interface TraineeRepository extends JpaRepository<Trainee, Long> {

  Optional<Trainee> findByAma(@Param("ama") String ama);
}
