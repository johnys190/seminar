package com.vetx.starter.repository;

import com.vetx.starter.model.SeminarTraineeSpecialty;
import com.vetx.starter.model.SeminarTraineeSpecialtyProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.web.bind.annotation.CrossOrigin;

@RepositoryRestResource(excerptProjection = SeminarTraineeSpecialtyProjection.class)
@CrossOrigin
//@PreAuthorize("hasAnyRole('ROLE_USER', 'ROLE_ADMIN')")
public interface SeminarTraineeSpecialtyRepository extends JpaRepository<SeminarTraineeSpecialty, Long> {
}