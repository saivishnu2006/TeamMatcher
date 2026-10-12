package com.aiteammatcher.config;

import com.aiteammatcher.entity.*;
import com.aiteammatcher.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final SkillRepository skillRepository;
    private final InterestRepository interestRepository;
    private final ProjectRepository projectRepository;
    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(
            UserRepository userRepository,
            SkillRepository skillRepository,
            InterestRepository interestRepository,
            ProjectRepository projectRepository,
            TeamRepository teamRepository,
            TeamMemberRepository teamMemberRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.skillRepository = skillRepository;
        this.interestRepository = interestRepository;
        this.projectRepository = projectRepository;
        this.teamRepository = teamRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (skillRepository.count() == 0) {
            seedSkillsAndInterests();
        }

        if (userRepository.count() == 0) {
            seedUsersAndProjects();
        }
    }

    private void seedSkillsAndInterests() {
        logger.info("Seeding skills and interests catalog...");

        List<Skill> skills = List.of(
                new Skill("React", "Frontend"),
                new Skill("Spring Boot", "Backend"),
                new Skill("MySQL", "Database"),
                new Skill("Java", "Backend"),
                new Skill("JavaScript", "Frontend"),
                new Skill("TypeScript", "Frontend"),
                new Skill("UI/UX Design", "Design"),
                new Skill("Figma", "Design"),
                new Skill("QA Testing", "Testing"),
                new Skill("REST API", "Backend"),
                new Skill("Docker", "DevOps"),
                new Skill("AWS", "Cloud"),
                new Skill("PostgreSQL", "Database"),
                new Skill("Python", "AI/Data"),
                new Skill("Machine Learning", "AI/Data"),
                new Skill("Next.js", "Frontend"),
                new Skill("Tailwind CSS", "Frontend")
        );
        skillRepository.saveAll(skills);

        List<Interest> interests = List.of(
                new Interest("Healthcare Applications"),
                new Interest("Web Development"),
                new Interest("AI & Machine Learning"),
                new Interest("Fintech"),
                new Interest("Cloud Computing"),
                new Interest("Design Systems"),
                new Interest("Test Automation"),
                new Interest("E-Commerce"),
                new Interest("Cybersecurity")
        );
        interestRepository.saveAll(interests);
    }

    private void seedUsersAndProjects() {
        logger.info("Seeding initial users, profiles, and demo projects...");

        Map<String, Skill> skillMap = new HashMap<>();
        skillRepository.findAll().forEach(s -> skillMap.put(s.getName().toLowerCase(), s));

        Map<String, Interest> interestMap = new HashMap<>();
        interestRepository.findAll().forEach(i -> interestMap.put(i.getName().toLowerCase(), i));

        // 1. Admin
        User admin = new User("admin@aiteammatcher.com", passwordEncoder.encode("admin123"), "System Administrator", "ROLE_ADMIN");
        Profile adminProfile = new Profile(admin);
        adminProfile.setPreferredRole("Platform Admin");
        adminProfile.setBio("System Administrator overseeing user matching, platform integrity, and projects.");
        admin.setProfile(adminProfile);
        userRepository.save(admin);

        // 2. User A (Project Creator)
        User userA = new User("usera@gmail.com", passwordEncoder.encode("password123"), "User A (Project Lead)", "ROLE_USER");
        Profile profileA = new Profile(userA);
        profileA.setPreferredRole("Full Stack Developer");
        profileA.setExperienceLevel("Senior");
        profileA.setAvailability("Full-time");
        profileA.setBio("Engineering lead launching an innovative healthcare appointment platform.");
        profileA.setPreviousProjects("EHR Patient Portal, HealthConnect Mobile");
        addSkillToProfile(profileA, skillMap.get("react"), "Advanced");
        addSkillToProfile(profileA, skillMap.get("spring boot"), "Advanced");
        addSkillToProfile(profileA, skillMap.get("mysql"), "Intermediate");
        addInterestToProfile(profileA, interestMap.get("healthcare applications"));
        addInterestToProfile(profileA, interestMap.get("web development"));
        userA.setProfile(profileA);
        User savedUserA = userRepository.save(userA);

        // 3. Rahul (Backend Developer)
        User rahul = new User("rahul@gmail.com", passwordEncoder.encode("password123"), "Rahul Kumar", "ROLE_USER");
        Profile profileRahul = new Profile(rahul);
        profileRahul.setPreferredRole("Backend Developer");
        profileRahul.setExperienceLevel("Intermediate");
        profileRahul.setAvailability("Full-time");
        profileRahul.setBio("Interested in backend development and healthcare technology. Built two Spring Boot projects with MySQL persistence.");
        profileRahul.setPreviousProjects("Smart Clinic API, Telehealth Appointment Manager");
        addSkillToProfile(profileRahul, skillMap.get("java"), "Advanced");
        addSkillToProfile(profileRahul, skillMap.get("spring boot"), "Advanced");
        addSkillToProfile(profileRahul, skillMap.get("mysql"), "Advanced");
        addSkillToProfile(profileRahul, skillMap.get("rest api"), "Advanced");
        addInterestToProfile(profileRahul, interestMap.get("healthcare applications"));
        addInterestToProfile(profileRahul, interestMap.get("web development"));
        rahul.setProfile(profileRahul);
        userRepository.save(rahul);

        // 4. Sai (Frontend Developer)
        User sai = new User("sai@gmail.com", passwordEncoder.encode("password123"), "Sai Teja", "ROLE_USER");
        Profile profileSai = new Profile(sai);
        profileSai.setPreferredRole("Frontend Developer");
        profileSai.setExperienceLevel("Senior");
        profileSai.setAvailability("Full-time");
        profileSai.setBio("Frontend architect specializing in responsive React applications, state management, and accessible component libraries.");
        profileSai.setPreviousProjects("CareFlow Doctor Dashboard, HealthPlus Portal");
        addSkillToProfile(profileSai, skillMap.get("react"), "Expert");
        addSkillToProfile(profileSai, skillMap.get("javascript"), "Expert");
        addSkillToProfile(profileSai, skillMap.get("typescript"), "Advanced");
        addSkillToProfile(profileSai, skillMap.get("tailwind css"), "Advanced");
        addInterestToProfile(profileSai, interestMap.get("web development"));
        addInterestToProfile(profileSai, interestMap.get("design systems"));
        sai.setProfile(profileSai);
        userRepository.save(sai);

        // 5. Anil (UI/UX Designer)
        User anil = new User("anil@gmail.com", passwordEncoder.encode("password123"), "Anil Sharma", "ROLE_USER");
        Profile profileAnil = new Profile(anil);
        profileAnil.setPreferredRole("UI/UX Designer");
        profileAnil.setExperienceLevel("Intermediate");
        profileAnil.setAvailability("Part-time (20 hrs/week)");
        profileAnil.setBio("Product designer dedicated to empathetic digital health experiences and streamlined booking flows.");
        profileAnil.setPreviousProjects("MedBooking Figma Kit, Patient Intake Flow");
        addSkillToProfile(profileAnil, skillMap.get("ui/ux design"), "Expert");
        addSkillToProfile(profileAnil, skillMap.get("figma"), "Expert");
        addInterestToProfile(profileAnil, interestMap.get("design systems"));
        addInterestToProfile(profileAnil, interestMap.get("healthcare applications"));
        anil.setProfile(profileAnil);
        userRepository.save(anil);

        // 6. Priya (QA Tester)
        User priya = new User("priya@gmail.com", passwordEncoder.encode("password123"), "Priya Patel", "ROLE_USER");
        Profile profilePriya = new Profile(priya);
        profilePriya.setPreferredRole("QA Tester");
        profilePriya.setExperienceLevel("Intermediate");
        profilePriya.setAvailability("Full-time");
        profilePriya.setBio("Quality assurance specialist ensuring bulletproof health record workflows, HIPAA compliance testing, and automated API checks.");
        profilePriya.setPreviousProjects("HealthSync Automated QA Suite, DoctorVerify Tests");
        addSkillToProfile(profilePriya, skillMap.get("qa testing"), "Advanced");
        addSkillToProfile(profilePriya, skillMap.get("rest api"), "Intermediate");
        addSkillToProfile(profilePriya, skillMap.get("java"), "Beginner");
        addInterestToProfile(profilePriya, interestMap.get("test automation"));
        addInterestToProfile(profilePriya, interestMap.get("healthcare applications"));
        priya.setProfile(profilePriya);
        userRepository.save(priya);

        // Create Sample Project "Smart Healthcare Platform" owned by User A
        Project project = new Project();
        project.setOwner(savedUserA);
        project.setName("Smart Healthcare Platform");
        project.setDescription("Build a web application that allows patients to find nearby doctors, view availability, and book appointments securely.");
        project.setTeamSize(4);
        project.setDuration("4 months");
        project.setAvailabilityRequirement("Full-time");
        project.setComplexity("Medium");
        project.setStatus("OPEN");

        project.getRequiredSkills().add(new ProjectSkill(project, skillMap.get("react")));
        project.getRequiredSkills().add(new ProjectSkill(project, skillMap.get("spring boot")));
        project.getRequiredSkills().add(new ProjectSkill(project, skillMap.get("mysql")));

        project.getRequiredRoles().add(new ProjectRole(project, "Frontend Developer"));
        project.getRequiredRoles().add(new ProjectRole(project, "Backend Developer"));
        project.getRequiredRoles().add(new ProjectRole(project, "UI/UX Designer"));

        Project savedProject = projectRepository.save(project);

        Team team = new Team(savedProject, savedProject.getName() + " Team");
        Team savedTeam = teamRepository.save(team);

        TeamMember lead = new TeamMember(savedTeam, savedUserA, "Project Lead / Owner");
        teamMemberRepository.save(lead);
        savedTeam.getMembers().add(lead);

        logger.info("Data initialization complete! Demo users and Smart Healthcare Platform created.");
    }

    private void addSkillToProfile(Profile profile, Skill skill, String level) {
        if (skill != null) {
            UserSkill us = new UserSkill(profile, skill, level);
            profile.getUserSkills().add(us);
        }
    }

    private void addInterestToProfile(Profile profile, Interest interest) {
        if (interest != null) {
            UserInterest ui = new UserInterest(profile, interest);
            profile.getUserInterests().add(ui);
        }
    }
}
