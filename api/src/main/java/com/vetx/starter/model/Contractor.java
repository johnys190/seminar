package com.vetx.starter.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.vetx.starter.model.audit.UserDateAudit;
import lombok.*;
import org.hibernate.annotations.NaturalId;

import javax.persistence.*;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Builder
@EqualsAndHashCode(callSuper = false)
@AllArgsConstructor
@RequiredArgsConstructor
public class Contractor extends UserDateAudit {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @NaturalId
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long key;

  @NotBlank
  @Size(max = 140)
  private String name;

  @NotBlank
  @Size(max = 140)
  private String activity;

  @NotBlank
  @Size(max = 140)
  private String address;

  @NotBlank
  @Size(min = 8, max = 10)
  private Long phoneNumber;

  @Email
  private String email;

  @NotBlank
  @Size(max = 140)
  private String representativeName;

  @NotBlank
  @Size(max = 140)
  private String DOY;

  @NotBlank
  @NaturalId
  private Long afm;

  @JsonManagedReference
  @EqualsAndHashCode.Exclude
  @OneToMany(
      mappedBy = "seminar",
      targetEntity = SeminarTrainee.class,
      cascade = CascadeType.ALL,
      fetch = FetchType.EAGER,
      orphanRemoval = true
  )
  @Builder.Default
  private List<SeminarTrainee> seminarTraineeList = new ArrayList<>();
}
