package com.wallet.repository;

import com.wallet.entity.Transaction;
import com.wallet.entity.TransactionStatus;
import com.wallet.entity.TransactionType;
import com.wallet.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    Optional<Transaction> findByReferenceNumber(String referenceNumber);

    @Query("SELECT t FROM Transaction t WHERE (t.sender = :user OR t.receiver = :user) ORDER BY t.transactionDate DESC")
    Page<Transaction> findByUser(@Param("user") User user, Pageable pageable);

    @Query("SELECT t FROM Transaction t WHERE (t.sender = :user OR t.receiver = :user) ORDER BY t.transactionDate DESC")
    List<Transaction> findRecentByUser(@Param("user") User user, Pageable pageable);

    @Query("SELECT t FROM Transaction t WHERE " +
           "(t.sender = :user OR t.receiver = :user) AND " +
           "(:type IS NULL OR t.transactionType = :type) AND " +
           "(:status IS NULL OR t.status = :status) AND " +
           "(:startDate IS NULL OR t.transactionDate >= :startDate) AND " +
           "(:endDate IS NULL OR t.transactionDate <= :endDate) AND " +
           "(:minAmount IS NULL OR t.amount >= :minAmount) AND " +
           "(:maxAmount IS NULL OR t.amount <= :maxAmount) " +
           "ORDER BY t.transactionDate DESC")
    Page<Transaction> findUserTransactionsFiltered(
            @Param("user") User user,
            @Param("type") TransactionType type,
            @Param("status") TransactionStatus status,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("minAmount") BigDecimal minAmount,
            @Param("maxAmount") BigDecimal maxAmount,
            Pageable pageable);

    @Query("SELECT t FROM Transaction t WHERE " +
           "(:type IS NULL OR t.transactionType = :type) AND " +
           "(:status IS NULL OR t.status = :status) AND " +
           "(:search IS NULL OR :search = '' OR " +
           "t.referenceNumber LIKE CONCAT('%', :search, '%') OR " +
           "t.sender.name LIKE CONCAT('%', :search, '%') OR " +
           "t.receiver.name LIKE CONCAT('%', :search, '%')) " +
           "ORDER BY t.transactionDate DESC")
    Page<Transaction> findAdminTransactionsFiltered(
            @Param("type") TransactionType type,
            @Param("status") TransactionStatus status,
            @Param("search") String search,
            Pageable pageable);

    long countByStatus(TransactionStatus status);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.transactionType = 'TRANSFER' AND t.status = 'SUCCESS'")
    BigDecimal getTotalMoneyTransferred();

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.sender = :user AND t.status = 'SUCCESS'")
    BigDecimal getTotalSentByUser(@Param("user") User user);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.receiver = :user AND t.status = 'SUCCESS' AND t.transactionType = 'TRANSFER'")
    BigDecimal getTotalReceivedByUser(@Param("user") User user);
}
