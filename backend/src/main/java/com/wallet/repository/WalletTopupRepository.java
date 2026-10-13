package com.wallet.repository;

import com.wallet.entity.User;
import com.wallet.entity.WalletTopup;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WalletTopupRepository extends JpaRepository<WalletTopup, Long> {

    List<WalletTopup> findByUserOrderByCreatedAtDesc(User user);

    Page<WalletTopup> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);

    List<WalletTopup> findByUser_UserIdOrderByCreatedAtDesc(Long userId);
}
