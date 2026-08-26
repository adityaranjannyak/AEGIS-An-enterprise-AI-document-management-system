package com.aditya.DMS.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.aditya.DMS.service.RagAnswerService;
import com.aditya.DMS.service.ActivityService;
import com.aditya.DMS.entity.User;
import com.aditya.DMS.repository.UserRepo;

@RestController
@PreAuthorize("isAuthenticated()")
public class RagController {

    private final RagAnswerService ragAnswerService;
    private final ActivityService activityService;
    private final UserRepo userRepo;

    public RagController(
            RagAnswerService ragAnswerService,
            ActivityService activityService,
            UserRepo userRepo) {
        this.ragAnswerService = ragAnswerService;
        this.activityService = activityService;
        this.userRepo = userRepo;
    }

    @GetMapping("/rag/ask")
    public String askQuestion(
            @RequestParam long documentId,
            @RequestParam String question,
            Authentication authentication) {
        return ragAnswerService.answerQuestion(
                documentId,
                question,
                authentication.getName(),
                isAdmin(authentication));
    }

    @PostMapping("/rag/ask")
    public RagResponse askAuthorizedScope(
            @RequestBody RagRequest request,
            Authentication authentication) {
        String answer = ragAnswerService.answerQuestionAcrossDocuments(
                request.getDocumentIds(),
                request.getQuestion(),
                authentication.getName(),
                isAdmin(authentication));
        User user = userRepo.findByUsername(authentication.getName());
        if (user != null) {
            String scope = request.getDocumentIds() == null ||
                    request.getDocumentIds().isEmpty()
                    ? "all authorized documents"
                    : request.getDocumentIds().size() + " selected document(s)";
            activityService.log(user, null, "AI_QUERY",
                    "Asked AI across " + scope + ".");
        }
        return new RagResponse(answer);
    }

    private boolean isAdmin(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .anyMatch(authority ->
                        authority.getAuthority().equals("ROLE_ADMIN"));
    }

    public static class RagRequest {
        private String question;
        private List<Long> documentIds;

        public String getQuestion() { return question; }
        public void setQuestion(String question) { this.question = question; }
        public List<Long> getDocumentIds() { return documentIds; }
        public void setDocumentIds(List<Long> documentIds) { this.documentIds = documentIds; }
    }

    public static class RagResponse {
        private final String answer;

        public RagResponse(String answer) { this.answer = answer; }
        public String getAnswer() { return answer; }
    }
}
