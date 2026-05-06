package SnackDash.backend.service;

import SnackDash.backend.entity.User;
import SnackDash.backend.entity.WalletTransaction;
import SnackDash.backend.repository.UserRepository;
import SnackDash.backend.repository.WalletTransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class WalletService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WalletTransactionRepository transactionRepository;

    @Transactional
    public void issueRefund(Long userId, BigDecimal refundAmount) {
        if (refundAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Refund amount must be greater than zero.");
        }

        // 1. Find User
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 2. Add funds back to wallet
        user.setWalletBalance(user.getWalletBalance().add(refundAmount));
        userRepository.save(user);

        // 3. Log the transaction securely
        WalletTransaction transaction = new WalletTransaction();
        transaction.setUser(user);
        transaction.setAmount(refundAmount);
       transaction.setTransactionType(SnackDash.backend.entity.Enums.TransactionType.REFUND);
        transaction.setCreatedAt(LocalDateTime.now());
        
        transactionRepository.save(transaction);
    }
}