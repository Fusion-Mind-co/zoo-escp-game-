document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const gameBoard = document.getElementById("game-board");
  const slot = document.getElementById("slot");
  const coinCountElement = document.getElementById("coin-count");
  const levelDisplayElement = document.getElementById("current-level");
  const undoBtn = document.getElementById("undo-btn");
  const shuffleBtn = document.getElementById("shuffle-btn");
  const hintBtn = document.getElementById("hint-btn");
  const resetBtn = document.getElementById("reset-btn");
  const levelResetBtn = document.getElementById("level-reset-btn");
  const rankingListElement = document.getElementById("ranking-list");
  const clearRankingBtn = document.getElementById("clear-ranking-btn");
  const slotContainer = document.getElementById("slot-container");
  const maxReachedLevelElement = document.getElementById("max-reached-level");

  const levelSelectionScreen = document.getElementById("level-selection");
  const startLevelSelect = document.getElementById("start-level-select");
  const startGameBtn = document.getElementById("start-game-btn");
  const stageSelectBtn = document.getElementById("stage-select-btn");
  const stageSelectModal = document.getElementById("stage-select-modal");
  const modalLevelSelect = document.getElementById("modal-level-select");
  const modalStartBtn = document.getElementById("modal-start-btn");
  const modalCancelBtn = document.getElementById("modal-cancel-btn");
  const backToTitleBtn = document.getElementById("back-to-title-btn");

  // Home screen elements - ADD THESE MISSING SELECTIONS
  const homeScreen = document.getElementById("home-screen");
  const startNewGameBtn = document.getElementById("start-new-game-btn");
  const continueGameBtn = document.getElementById("continue-game-btn");
  const homeStageSelectBtn = document.getElementById("home-stage-select-btn");

  // Audio Elements
  const bgm = document.getElementById("bgm");
  const seClick = document.getElementById("se-click");
  const seMatch = document.getElementById("se-match");
  const seGameOver = document.getElementById("se-gameover");
  const seWin = document.getElementById("se-win");

  // Game Constants
  const TILE_WIDTH = 50;
  const TILE_HEIGHT = 50;
  const BOARD_WIDTH = 550;
  const BOARD_HEIGHT = 400;
  const ALL_TILE_TYPES = [
    "🐶",
    "🐱",
    "🐭",
    "🐹",
    "🐰",
    "🦊",
    "🐻",
    "🐼",
    "🐨",
    "🐯",
    "🦁",
    "🐮",
    "🐷",
    "🐸",
    "🐵",
    "🐔",
    "🐧",
    "🐦",
    "🐤",
    "🦆",
    "🦄",
    "🦖",
    "🐙",
    "🦀",
    "🐠",
    "🐳",
    "🦋",
    "🐞",
    "🐢",
    "🐍",
    "🦎",
    "🦂",
    "🦓",
  ];
  const INITIAL_COINS = 100;
  const INITIAL_MAX_SLOTS = 8;
  const REWARD_COINS = 5;

  // Item Costs
  const COST_UNDO = 10;
  const COST_SHUFFLE = 30;
  const COST_HINT = 20;

  // Game State
  let boardTiles = [];
  let slotTiles = [];
  let moveHistory = [];
  let coins = 0;
  let maxSlots = INITIAL_MAX_SLOTS;
  let currentLevel = 1;
  let maxReachedLevel = 1; // 到達した最大ステージを記憶
  let bgmStarted = false; // BGM開始フラグ
  let isMatching = false;

  // --- Progress Management Functions ---
  function saveProgress() {
    localStorage.setItem("zooEscapeMaxLevel", maxReachedLevel.toString());
  }

  function loadProgress() {
    const savedMaxLevel = localStorage.getItem("zooEscapeMaxLevel");
    if (savedMaxLevel) {
      maxReachedLevel = parseInt(savedMaxLevel);
    } else {
      maxReachedLevel = 1; // 初回プレイ時は1
    }
  }

  function updateMaxReachedLevel(level) {
    if (level > maxReachedLevel) {
      maxReachedLevel = level;
      saveProgress();
      updateLevelSelectOptions(); // ステージセレクトの選択肢を更新
      updateProgressDisplay(); // 進捗表示を更新
    }
  }

  function updateLevelSelectOptions() {
    // メイン画面のステージセレクトの選択肢を更新
    if (startLevelSelect) {
      startLevelSelect.innerHTML = "";
      for (let i = 1; i <= maxReachedLevel; i++) {
        const option = document.createElement("option");
        option.value = i;
        option.textContent = `ステージ ${i}`;
        if (i === maxReachedLevel && i > 1) {
          option.textContent += " (NEW!)";
        }
        startLevelSelect.appendChild(option);
      }
      // 現在のレベルを選択状態にする
      startLevelSelect.value = currentLevel;
    }

    // モーダルのステージセレクトの選択肢も更新
    if (modalLevelSelect) {
      modalLevelSelect.innerHTML = "";
      for (let i = 1; i <= maxReachedLevel; i++) {
        const option = document.createElement("option");
        option.value = i;
        option.textContent = `ステージ ${i}`;
        if (i === maxReachedLevel && i > 1) {
          option.textContent += " (NEW!)";
        }
        modalLevelSelect.appendChild(option);
      }
      modalLevelSelect.value = currentLevel;
    }
  }

  // --- Home Screen Functions ---
  function showHomeScreen() {
    if (homeScreen) {
      homeScreen.style.display = "flex";
      homeScreen.classList.remove("hidden");
      document.body.classList.remove("game-mode");

      // プログレスを確認してボタンを表示
      updateHomeButtons();
    }
  }

  function hideHomeScreen() {
    if (homeScreen) {
      homeScreen.classList.add("hidden");
      setTimeout(() => {
        homeScreen.style.display = "none";
        document.body.classList.add("game-mode");
      }, 500);
    }
  }

  function updateProgressDisplay() {
    if (maxReachedLevelElement) {
      maxReachedLevelElement.textContent = maxReachedLevel;
    }
  }

  // --- Event Listeners ---
  if (undoBtn) undoBtn.addEventListener("click", useUndo);
  if (shuffleBtn) shuffleBtn.addEventListener("click", useShuffle);
  if (hintBtn) hintBtn.addEventListener("click", useHint);
  if (resetBtn) resetBtn.addEventListener("click", useReset);
  if (clearRankingBtn) clearRankingBtn.addEventListener("click", clearRanking);

  if (startGameBtn) {
    startGameBtn.addEventListener("click", () => {
      const selectedLevel = parseInt(startLevelSelect.value);
      setupGameForLevel(selectedLevel);
      showGameElements();
    });
  }

  // ステージセレクトボタンのイベントリスナー
  if (stageSelectBtn) {
    stageSelectBtn.addEventListener("click", () => {
      showStageSelectModal();
    });
  }

  // モーダル内のボタンイベント
  if (modalStartBtn) {
    modalStartBtn.addEventListener("click", () => {
      const selectedLevel = parseInt(modalLevelSelect.value);
      hideStageSelectModal();

      // ホーム画面から選択された場合
      if (homeScreen && homeScreen.style.display !== "none") {
        hideHomeScreen();
      }

      setupGameForLevel(selectedLevel);
      showGameElements();
    });
  }

  if (modalCancelBtn) {
    modalCancelBtn.addEventListener("click", () => {
      hideStageSelectModal();
    });
  }

  // ホーム画面のイベントリスナー
  if (startNewGameBtn) {
    startNewGameBtn.addEventListener("click", () => {
      hideHomeScreen();
      setupGameForLevel(1);
      showGameElements();
    });
  }

  if (continueGameBtn) {
    continueGameBtn.addEventListener("click", () => {
      hideHomeScreen();
      if (loadGameState()) {
        showGameElements();
      } else {
        // セーブデータがない場合は新しいゲームを開始
        setupGameForLevel(maxReachedLevel);
        showGameElements();
      }
    });
  }

  if (homeStageSelectBtn) {
    homeStageSelectBtn.addEventListener("click", () => {
      showStageSelectModal();
    });
  }

  // タイトルに戻るボタンのイベントリスナー
  if (backToTitleBtn) {
    backToTitleBtn.addEventListener("click", () => {
      backToTitle();
    });
  }

  // --- Audio Functions ---
  function playSE(audioElement) {
    if (audioElement) {
      // 既に再生中の場合は停止してからリセット
      audioElement.pause();
      audioElement.currentTime = 0;
      audioElement.play().catch((e) => console.log("Audio play failed:", e));
    }
  }

  function startBGM() {
    if (bgm && !bgmStarted) {
      bgm.volume = 0.3; // BGMの音量を少し下げる
      bgm.play().catch((e) => console.log("BGM autoplay failed:", e));
      bgmStarted = true;
    }
  }

  // --- Animation Functions ---
  function createParticleEffect(x, y) {
    const particleCount = 8;
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div");

      // 星とドットを混ぜる
      if (i % 2 === 0) {
        particle.className = "particle star";
      } else {
        particle.className = "particle";
      }

      particle.style.left = `${x + 25}px`; // タイルの中心
      particle.style.top = `${y + 25}px`;

      // ランダムな方向に飛ぶ
      const angle = (i / particleCount) * Math.PI * 2;
      const velocity = 30 + Math.random() * 20;
      const dx = Math.cos(angle) * velocity;
      const dy = Math.sin(angle) * velocity;

      particle.style.animation = `particleAnimation 0.8s ease-out forwards`;
      particle.style.transform = `translate(${dx}px, ${dy}px)`;

      if (slotContainer) {
        slotContainer.appendChild(particle);

        // アニメーション終了後にパーティクルを削除
        setTimeout(() => {
          if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
          }
        }, 800);
      }
    }
  }

  function createFlashEffect() {
    const flash = document.createElement("div");
    flash.className = "match-flash";
    if (slotContainer) {
      slotContainer.appendChild(flash);

      setTimeout(() => {
        if (flash.parentNode) {
          flash.parentNode.removeChild(flash);
        }
      }, 500);
    }
  }

  function animateRemoveTiles(tilesToRemove) {
    return new Promise((resolve) => {
      // フラッシュエフェクトを表示
      createFlashEffect();

      // 各タイルにアニメーションを適用
      tilesToRemove.forEach((tile, index) => {
        setTimeout(() => {
          tile.element.classList.add("removing");

          // タイルの位置を取得してパーティクルエフェクトを作成
          const rect = tile.element.getBoundingClientRect();
          const slotRect = slotContainer.getBoundingClientRect();
          const x = rect.left - slotRect.left;
          const y = rect.top - slotRect.top;

          createParticleEffect(x, y);
        }, index * 100);
      });

      // ───────────────────────────────────────────────────────
      // アニメーション完了後に実際にタイルを削除
      setTimeout(() => {
        // ① 削除対象タイルのインデックス一覧を取得
        //    findIndex() で現在の slotTiles 内の位置を調べる
        const indices = tilesToRemove
          .map((tile) => slotTiles.findIndex((t) => t.id === tile.id))
          .filter((idx) => idx > -1) // -1（見つからなかったもの）は除外
          .sort((a, b) => b - a); // 降順（こうじゅん）にソート

        // ② 大きいインデックスから splice（スプライス）で削除
        //    splice: 配列の特定位置から要素を取り出すメソッド
        indices.forEach((idx) => {
          slotTiles.splice(idx, 1);
        });

        // ③ DOM 要素を親ノードから削除
        tilesToRemove.forEach((tile) => {
          if (tile.element.parentNode) {
            tile.element.parentNode.removeChild(tile.element);
          }
        });
        // 削除後のゲーム状態を localStorage に保存
        saveGameState();

        resolve();
      }, 600 + tilesToRemove.length * 100);
    });
  }

  // --- Save/Load Game State ---
  function saveGameState() {
    const gameState = {
      boardTiles: boardTiles.map((tile) => ({
        type: tile.type,
        x: tile.x,
        y: tile.y,
        z: tile.z,
        id: tile.id,
      })),
      slotTiles: slotTiles.map((tile) => ({
        type: tile.type,
        x: tile.x,
        y: tile.y,
        z: tile.z,
        id: tile.id,
      })),
      moveHistory: moveHistory.map((snapshot) => ({
        movedTile: {
          type: snapshot.movedTile.type,
          x: snapshot.movedTile.x,
          y: snapshot.movedTile.y,
          z: snapshot.movedTile.z,
          id: snapshot.movedTile.id,
        },
        slotTilesBeforeMatch: snapshot.slotTilesBeforeMatch.map((tile) => ({
          type: tile.type,
          x: tile.x,
          y: tile.y,
          z: tile.z,
          id: tile.id,
        })),
        coinsBeforeMatch: snapshot.coinsBeforeMatch,
      })),
      coins: coins,
      maxSlots: maxSlots,
      currentLevel: currentLevel,
      maxReachedLevel: maxReachedLevel, // 到達ステージも保存
    };
    localStorage.setItem("zooEscapeGameState", JSON.stringify(gameState));
  }

  function loadGameState() {
    const savedState = localStorage.getItem("zooEscapeGameState");
    if (savedState) {
      const gameState = JSON.parse(savedState);

      if (gameBoard) gameBoard.innerHTML = "";
      if (slot) slot.innerHTML = "";

      boardTiles = gameState.boardTiles.map((data) => {
        const tileElement = createTileElement(data.type, data.id);
        tileElement.style.position = "absolute";
        tileElement.style.left = `${data.x}px`;
        tileElement.style.top = `${data.y}px`;
        tileElement.style.zIndex = data.z;
        if (gameBoard) gameBoard.appendChild(tileElement);
        return { element: tileElement, ...data };
      });

      slotTiles = gameState.slotTiles.map((data) => {
        const tileElement = createTileElement(data.type, data.id);
        tileElement.style.position = "static";
        if (slot) slot.appendChild(tileElement);
        return { element: tileElement, ...data };
      });

      // moveHistory の復元を修正
      moveHistory = gameState.moveHistory.map((snapshot) => ({
        movedTile: snapshot.movedTile,
        slotTilesBeforeMatch: snapshot.slotTilesBeforeMatch,
        coinsBeforeMatch: snapshot.coinsBeforeMatch,
      }));

      coins = gameState.coins;
      maxSlots = gameState.maxSlots;
      currentLevel = gameState.currentLevel;

      // 到達ステージも復元（後方互換性のため、存在しない場合は現在のレベルを使用）
      if (gameState.maxReachedLevel !== undefined) {
        maxReachedLevel = gameState.maxReachedLevel;
      } else {
        maxReachedLevel = currentLevel;
      }

      updateCoinDisplay();
      updateLevelDisplay();
      updateTileStates();
      updateButtonStates();
      return true;
    }
    return false;
  }

  // --- Game Setup for a specific level ---
  function setupGameForLevel(level) {
    if (gameBoard) gameBoard.innerHTML = "";
    if (slot) slot.innerHTML = "";
    boardTiles = [];
    slotTiles = [];
    moveHistory = [];
    coins = INITIAL_COINS;
    maxSlots = INITIAL_MAX_SLOTS;
    currentLevel = level;

    updateCoinDisplay();
    updateLevelDisplay();

    const levelConfig = getLevelConfig(currentLevel);
    const tileData = createTileData(
      levelConfig.tileTypesCount,
      levelConfig.tileCount
    );
    createBoardTiles(tileData, levelConfig.tileCount);

    updateTileStates();
    updateButtonStates();
    saveGameState();
  }

  // --- Initial Game Start (on page load) ---
  function startGame() {
    // プログレスを読み込み
    loadProgress();

    // レベルセレクトの選択肢を初期化
    updateLevelSelectOptions();

    // ホーム画面を表示
    showHomeScreen();

    renderRanking();
    updateProgressDisplay(); // 進捗表示を初期化

    // BGMを開始（ユーザー操作後に再生）
    document.addEventListener(
      "click",
      function startBGMOnFirstClick() {
        startBGM();
        document.removeEventListener("click", startBGMOnFirstClick);
      },
      { once: true }
    );
  }

  // --- Display/Hide Game Elements ---
  function showGameElements() {
    hideHomeScreen();
    if (levelSelectionScreen) levelSelectionScreen.style.display = "none";

    const header = document.querySelector(".header");
    if (header) header.style.display = "flex";
    if (gameBoard) gameBoard.style.display = "block";
    if (slotContainer) slotContainer.style.display = "flex";

    const controls = document.getElementById("controls");
    if (controls) controls.style.display = "flex";

    const rankingContainer = document.getElementById("ranking-container");
    if (rankingContainer) rankingContainer.style.display = "block";
  }

  function showStageSelectModal() {
    updateLevelSelectOptions(); // 最新の選択肢で更新
    if (stageSelectModal) {
      stageSelectModal.style.display = "flex";
      setTimeout(() => {
        stageSelectModal.classList.add("show");
      }, 10);
    }
  }

  function hideStageSelectModal() {
    if (stageSelectModal) {
      stageSelectModal.classList.remove("show");
      setTimeout(() => {
        stageSelectModal.style.display = "none";
      }, 300);
    }
  }

  function updateHomeButtons() {
    const hasProgress =
      maxReachedLevel > 1 || localStorage.getItem("zooEscapeGameState");

    if (startNewGameBtn && continueGameBtn && homeStageSelectBtn) {
      if (hasProgress) {
        // 進捗がある場合：つづきから＋ステージセレクト
        startNewGameBtn.style.display = "none";
        continueGameBtn.style.display = "block";
        homeStageSelectBtn.style.display = "block";
      } else {
        // 初回プレイ：はじめるのみ
        startNewGameBtn.style.display = "block";
        continueGameBtn.style.display = "none";
        homeStageSelectBtn.style.display = "none";
      }
    }
  }

  // タイトルに戻る機能
  function backToTitle() {
    // 確認ダイアログを表示
    if (
      confirm(
        "ゲームを中断してタイトルに戻りますか？\n（進行状況は保存されます）"
      )
    ) {
      // 現在のゲーム状態を保存
      saveGameState();

      // ゲーム画面の要素を非表示
      hideGameElements();

      // ホーム画面を表示
      showHomeScreen();

      // プログレス表示を更新
      updateHomeButtons();
    }
  }

  // ゲーム画面の要素を非表示にする関数
  function hideGameElements() {
    const header = document.querySelector(".header");
    if (header) header.style.display = "none";
    if (gameBoard) gameBoard.style.display = "none";
    if (slotContainer) slotContainer.style.display = "none";

    const controls = document.getElementById("controls");
    if (controls) controls.style.display = "none";

    const rankingContainer = document.getElementById("ranking-container");
    if (rankingContainer) rankingContainer.style.display = "none";

    if (levelSelectionScreen) levelSelectionScreen.style.display = "none";

    // body のクラスも削除
    document.body.classList.remove("game-mode");
  }

  function getLevelConfig(level) {
    switch (level) {
      case 1:
        return { tileCount: 60, tileTypesCount: 10 };
      case 2:
        return { tileCount: 72, tileTypesCount: 12 };
      case 3:
        return { tileCount: 84, tileTypesCount: 14 };
      case 4:
        return { tileCount: 96, tileTypesCount: 16 };
      case 5:
        return { tileCount: 108, tileTypesCount: 18 };
      default:
        const baseTypes = 18;
        const typesToAdd = Math.floor((level - 5) / 2) * 2;
        const currentTypes = Math.min(
          ALL_TILE_TYPES.length,
          baseTypes + typesToAdd
        );
        return { tileCount: currentTypes * 6, tileTypesCount: currentTypes };
    }
  }

  function createTileData(typesCount, totalTileCount) {
    const data = [];
    const types = ALL_TILE_TYPES.slice(0, typesCount);
    const tilesPerType = totalTileCount / typesCount;

    for (let i = 0; i < types.length; i++) {
      for (let j = 0; j < tilesPerType; j++) {
        data.push(types[i]);
      }
    }
    return shuffleArray(data);
  }

  function createBoardTiles(tileData, totalTileCount) {
    let tileIndex = 0;
    for (let i = 0; i < totalTileCount; i++) {
      const tile = createTileElement(tileData[tileIndex], tileIndex);
      const zIndex = tileIndex; // Z-index based on creation order

      // Generate random position within board boundaries
      // Ensure there's enough space for the tile itself
      let randomX = Math.random() * (BOARD_WIDTH - TILE_WIDTH);
      let randomY = Math.random() * (BOARD_HEIGHT - TILE_HEIGHT);

      // Add a very subtle stacking/overlap effect
      // This will make tiles slightly offset from each other, creating a "layered" look
      const subtleOverlapX = (Math.random() - 0.5) * 15; // +/- 7.5px
      const subtleOverlapY = (Math.random() - 0.5) * 15; // +/- 7.5px

      let finalX = randomX + subtleOverlapX;
      let finalY = randomY + subtleOverlapY;

      // Ensure tiles stay within board boundaries after adding subtle overlap
      finalX = Math.max(0, Math.min(finalX, BOARD_WIDTH - TILE_WIDTH));
      finalY = Math.max(0, Math.min(finalY, BOARD_HEIGHT - TILE_HEIGHT));

      tile.style.left = `${finalX}px`;
      tile.style.top = `${finalY}px`;
      tile.style.zIndex = zIndex;

      const tileObject = {
        element: tile,
        type: tileData[tileIndex],
        x: finalX,
        y: finalY,
        z: zIndex,
        id: tileIndex,
      };
      boardTiles.push(tileObject);
      if (gameBoard) gameBoard.appendChild(tile);
      tileIndex++;
    }
  }

  function createTileElement(type, id) {
    const tile = document.createElement("div");
    tile.classList.add("tile");
    tile.dataset.type = type;
    tile.dataset.id = id;
    tile.textContent = type;
    tile.addEventListener("click", () => onTileClick(tile));
    return tile;
  }

  // --- Tile Interaction ---
  function onTileClick(tileElement) {
    const tileId = parseInt(tileElement.dataset.id);
    const tile = boardTiles.find((t) => t.id === tileId);

    if (tile && isTileUnlocked(tile)) {
      console.log("選択音再生");
      playSE(seClick);

      moveTileToSlot(tile);
      saveGameState();
    }
  }

  function isTileUnlocked(tile) {
    for (const otherTile of boardTiles) {
      if (otherTile.z > tile.z) {
        if (
          tile.x < otherTile.x + TILE_WIDTH &&
          tile.x + TILE_WIDTH > otherTile.x &&
          tile.y < otherTile.y + TILE_HEIGHT &&
          tile.y + TILE_HEIGHT > otherTile.y
        ) {
          return false;
        }
      }
    }
    return true;
  }

  function updateTileStates() {
    boardTiles.forEach((tile) => {
      tile.element.classList.toggle("locked", !isTileUnlocked(tile));
      tile.element.classList.remove("hint-highlight");
    });
  }

  // --- Slot Logic ---
  async function moveTileToSlot(tile) {
    if (slotTiles.length >= maxSlots) return;

    const tileIndex = boardTiles.findIndex((t) => t.id === tile.id);
    if (tileIndex > -1) {
      boardTiles.splice(tileIndex, 1);
      if (gameBoard) gameBoard.removeChild(tile.element);
    }

    tile.element.style.position = "static";
    tile.element.style.left = "";
    tile.element.style.top = "";
    tile.element.style.zIndex = "";

    if (slot) slot.appendChild(tile.element);
    slotTiles.push(tile);

    // 移動前の状態をスナップショットとして保存
    const gameSnapshot = {
      movedTile: tile,
      slotTilesBeforeMatch: [...slotTiles], // 移動後のスロット状態
      coinsBeforeMatch: coins,
    };
    moveHistory.push(gameSnapshot);

    sortSlot();

    // 3つ揃った場合の効果音を事前にチェックして再生
    const willMatch = checkForMatches();
    if (willMatch) {
      console.log("消去音再生：移動時");
      playSE(seMatch);
    }

    await checkSlotForMatches(); // マッチ処理を待つ
    updateTileStates();
    updateButtonStates();
    checkWinCondition();
    checkGameOver();
  }

  function sortSlot() {
    slotTiles.sort((a, b) => a.type.localeCompare(b.type));
    if (slot) {
      slotTiles.forEach((tile) => slot.appendChild(tile.element));
    }
  }

  // マッチするかどうかを事前にチェックする関数
  function checkForMatches() {
    const typeCounts = {};
    slotTiles.forEach((tile) => {
      typeCounts[tile.type] = (typeCounts[tile.type] || 0) + 1;
    });

    for (const type in typeCounts) {
      if (typeCounts[type] === 3) {
        return true;
      }
    }
    return false;
  }

  async function checkSlotForMatches() {
    // 同時実行ガード（アニメ中は中断）
    if (isMatching) return;

    let found; // マッチがあったかのフラグ
    do {
      // マッチ処理の開始をマーク
      isMatching = true;
      found = false;

      // ① カウントを集計
      const typeCounts = {};
      slotTiles.forEach((tile) => {
        typeCounts[tile.type] = (typeCounts[tile.type] || 0) + 1;
      });

      // ② どのタイプがちょうど3個か探す
      for (const type in typeCounts) {
        if (typeCounts[type] === 3) {
          // 削除対象タイルを取得
          const tilesToRemove = slotTiles.filter((t) => t.type === type);

          // ③ アニメーション＋削除
          await animateRemoveTiles(tilesToRemove);

          // ④ 報酬・音声
          coins += REWARD_COINS;
          updateCoinDisplay();
          playSE(seMatch);

          found = true;
          break; // 一度に1種類だけ処理
        }
      }

      // アニメーション完了後はガードを解除
      isMatching = false;

      // ⑤ 「また3つ揃っていないか」ループで繰り返す
    } while (found);
  }

  // --- Control Button Functions ---
  function useUndo() {
    if (coins < COST_UNDO || moveHistory.length === 0) return;

    coins -= COST_UNDO;
    updateCoinDisplay();

    // 最後のスナップショットを取得
    const lastSnapshot = moveHistory.pop();
    const { movedTile, slotTilesBeforeMatch, coinsBeforeMatch } = lastSnapshot;

    // スロットを完全にクリア
    if (slot) slot.innerHTML = "";
    slotTiles.length = 0; // 配列をクリア

    // 移動前の状態を復元：移動したタイルをボードに戻す
    const restoredBoardTile = createTileElement(movedTile.type, movedTile.id);
    restoredBoardTile.style.position = "absolute";
    restoredBoardTile.style.left = `${movedTile.x}px`;
    restoredBoardTile.style.top = `${movedTile.y}px`;
    restoredBoardTile.style.zIndex = movedTile.z;

    boardTiles.push({
      element: restoredBoardTile,
      type: movedTile.type,
      x: movedTile.x,
      y: movedTile.y,
      z: movedTile.z,
      id: movedTile.id,
    });
    if (gameBoard) gameBoard.appendChild(restoredBoardTile);

    // スナップショットからスロット状態を復元（移動したタイル以外のタイルを復活）
    slotTilesBeforeMatch.forEach((tile) => {
      if (tile.id !== movedTile.id) {
        const restoredSlotTile = createTileElement(tile.type, tile.id);
        restoredSlotTile.style.position = "static";

        slotTiles.push({
          element: restoredSlotTile,
          type: tile.type,
          x: tile.x,
          y: tile.y,
          z: tile.z,
          id: tile.id,
        });
        if (slot) slot.appendChild(restoredSlotTile);
      }
    });

    // スロットをソート（マッチチェックは絶対に行わない）
    slotTiles.sort((a, b) => a.type.localeCompare(b.type));

    // DOMの順序も更新
    if (slot) {
      slot.innerHTML = "";
      slotTiles.forEach((tile) => {
        slot.appendChild(tile.element);
      });
    }

    // コインも移動前の状態に戻す
    coins = coinsBeforeMatch - COST_UNDO;
    updateCoinDisplay();

    updateTileStates();
    updateButtonStates();
    saveGameState();
  }

  function useShuffle() {
    if (coins < COST_SHUFFLE) return;
    // シャッフル音を再生
    playSE(document.getElementById("se-shuffle"));
    coins -= COST_SHUFFLE;
    updateCoinDisplay();

    const positions = boardTiles.map((tile) => ({ x: tile.x, y: tile.y }));
    shuffleArray(positions);

    boardTiles.forEach((tile, index) => {
      tile.x = positions[index].x;
      tile.y = positions[index].y;
      tile.element.style.left = `${tile.x}px`;
      tile.element.style.top = `${tile.y}px`;
    });

    updateTileStates();
    updateButtonStates();
    saveGameState();
  }

  function useHint() {
    if (coins < COST_HINT) return;

    const unlockedTiles = boardTiles.filter((tile) => isTileUnlocked(tile));
    const typeMap = new Map();

    for (const tile of unlockedTiles) {
      if (!typeMap.has(tile.type)) {
        typeMap.set(tile.type, []);
      }
      typeMap.get(tile.type).push(tile);
    }

    let hintFound = false;
    for (const [type, tilesOfType] of typeMap.entries()) {
      if (tilesOfType.length >= 3) {
        for (let i = 0; i < 3; i++) {
          tilesOfType[i].element.classList.add("hint-highlight");
        }
        hintFound = true;
        break;
      }
    }

    if (hintFound) {
      coins -= COST_HINT;
      updateCoinDisplay();
      updateButtonStates();
      saveGameState();

      // ヒント音を再生
      playSE(document.getElementById("se-hint"));

      setTimeout(() => {
        boardTiles.forEach((tile) =>
          tile.element.classList.remove("hint-highlight")
        );
      }, 1500);
    } else {
      alert("現在、揃えられる組み合わせはありません。");
    }
  }

  function useReset() {
    updateCoinDisplay();
    setupGameForLevel(currentLevel); // Reset to current level
    saveGameState();
  }

  function useLevelReset() {
    // ゲーム状態をクリア
    localStorage.removeItem("zooEscapeGameState");

    // モーダルを表示
    showStageSelectModal();
  }

  // --- UI and Game State Updates ---
  function updateCoinDisplay() {
    if (coinCountElement) {
      coinCountElement.textContent = coins;
    }
  }

  function updateLevelDisplay() {
    if (levelDisplayElement) {
      levelDisplayElement.textContent = currentLevel;
    }
  }

  function updateButtonStates() {
    if (undoBtn)
      undoBtn.disabled = coins < COST_UNDO || moveHistory.length === 0;
    if (shuffleBtn)
      shuffleBtn.disabled = coins < COST_SHUFFLE || boardTiles.length < 2;
    if (hintBtn) hintBtn.disabled = coins < COST_HINT;
  }

  function calculateScore() {
    return currentLevel * 100 + coins;
  }

  function saveScore(score) {
    const scores = JSON.parse(localStorage.getItem("zooEscapeRanking") || "[]");
    scores.push({ score: score, date: new Date().toLocaleString() });
    scores.sort((a, b) => b.score - a.score); // Sort descending
    localStorage.setItem("zooEscapeRanking", JSON.stringify(scores));
    renderRanking();
  }

  function renderRanking() {
    if (!rankingListElement) return;

    const scores = JSON.parse(localStorage.getItem("zooEscapeRanking") || "[]");
    rankingListElement.innerHTML = "";
    if (scores.length === 0) {
      rankingListElement.innerHTML = "<li>まだスコアがありません。</li>";
      return;
    }
    scores.forEach((entry, index) => {
      const listItem = document.createElement("li");
      listItem.textContent = `${index + 1}. ${entry.score} (${entry.date})`;
      rankingListElement.appendChild(listItem);
    });
  }

  function clearRanking() {
    if (confirm("本当にランキングをクリアしますか？")) {
      localStorage.removeItem("zooEscapeRanking");
      renderRanking();
    }
  }

  function checkWinCondition() {
    if (boardTiles.length === 0 && slotTiles.length === 0) {
      setTimeout(() => {
        // クリア時に到達ステージを更新
        updateMaxReachedLevel(currentLevel + 1);
        showStageClearAnimation();
        playSE(seWin);
        const score = calculateScore();
        saveScore(score);
      }, 100);
    }
  }

  function showStageClearAnimation() {
    // オーバーレイを作成
    const overlay = document.createElement("div");
    overlay.className = "stage-clear-overlay";

    // ステージ画像を作成
    const stageImg = document.createElement("img");
    stageImg.src = "image/stage.png";
    stageImg.className = "stage-image";
    stageImg.alt = "Stage";

    // クリア画像を作成
    const clearImg = document.createElement("img");
    clearImg.src = "image/clear.png";
    clearImg.className = "clear-image";
    clearImg.alt = "Clear";

    // 画像コンテナを作成
    const imageContainer = document.createElement("div");
    imageContainer.className = "stage-clear-container";

    // レベル番号を表示
    const levelText = document.createElement("div");
    levelText.className = "level-text";
    levelText.textContent = currentLevel;

    // ボタンコンテナを作成
    const buttonContainer = document.createElement("div");
    buttonContainer.className = "clear-buttons";

    // 次のステージボタン
    const nextStageBtn = document.createElement("button");
    nextStageBtn.className = "clear-button next-stage-btn";
    nextStageBtn.textContent = "次のステージ";
    nextStageBtn.addEventListener("click", () => {
      overlay.classList.add("fade-out");
      setTimeout(() => {
        document.body.removeChild(overlay);
        currentLevel++;
        setupGameForLevel(currentLevel);
      }, 500);
    });

    // もう一度ボタン
    const retryBtn = document.createElement("button");
    retryBtn.className = "clear-button retry-btn";
    retryBtn.textContent = "もう一度";
    retryBtn.addEventListener("click", () => {
      overlay.classList.add("fade-out");
      setTimeout(() => {
        document.body.removeChild(overlay);
        setupGameForLevel(currentLevel);
      }, 500);
    });

    // ステージセレクトボタンを追加
    const stageSelectBtn = document.createElement("button");
    stageSelectBtn.className = "clear-button stage-select-btn";
    stageSelectBtn.textContent = "ステージセレクト";
    stageSelectBtn.addEventListener("click", () => {
      overlay.classList.add("fade-out");
      setTimeout(() => {
        document.body.removeChild(overlay);
        showStageSelectModal();
      }, 500);
    });

    // ボタンをコンテナに追加
    buttonContainer.appendChild(nextStageBtn);
    buttonContainer.appendChild(retryBtn);
    buttonContainer.appendChild(stageSelectBtn);

    // 要素を組み立て
    imageContainer.appendChild(stageImg);
    imageContainer.appendChild(levelText);
    imageContainer.appendChild(clearImg);
    imageContainer.appendChild(buttonContainer);
    overlay.appendChild(imageContainer);

    // ボディに追加
    document.body.appendChild(overlay);

    // アニメーション開始
    setTimeout(() => {
      overlay.classList.add("show");
    }, 50);

    // 2秒後にボタンを表示
    setTimeout(() => {
      buttonContainer.classList.add("show-buttons");
    }, 2000);
  }

  function checkGameOver() {
    if (slotTiles.length >= maxSlots) {
      setTimeout(() => {
        showGameOverAnimation();
        playSE(seGameOver);
      }, 100);
    }
  }

  function showGameOverAnimation() {
    // オーバーレイを作成
    const overlay = document.createElement("div");
    overlay.className = "game-over-overlay";

    // ゲームオーバー画像を作成
    const gameOverImg = document.createElement("img");
    gameOverImg.src = "image/gameover.png";
    gameOverImg.className = "game-over-image";
    gameOverImg.alt = "Game Over";

    // 画像コンテナを作成
    const imageContainer = document.createElement("div");
    imageContainer.className = "game-over-container";

    // ボタンコンテナを作成
    const buttonContainer = document.createElement("div");
    buttonContainer.className = "game-over-buttons";

    // もう一度ボタン
    const retryBtn = document.createElement("button");
    retryBtn.className = "game-over-button";
    retryBtn.textContent = "もう一度";
    retryBtn.addEventListener("click", () => {
      overlay.classList.add("fade-out");
      setTimeout(() => {
        document.body.removeChild(overlay);
        setupGameForLevel(currentLevel); // 現在のレベルでリトライ
      }, 500);
    });

    // タイトルに戻るボタンに変更（ステージセレクトボタンを廃止）
    const backToTitleBtn = document.createElement("button");
    backToTitleBtn.className = "game-over-button";
    backToTitleBtn.textContent = "タイトルに戻る";
    backToTitleBtn.addEventListener("click", () => {
      overlay.classList.add("fade-out");
      setTimeout(() => {
        document.body.removeChild(overlay);
        // ゲーム状態をクリアしてからタイトルに戻る
        localStorage.removeItem("zooEscapeGameState");
        hideGameElements();
        showHomeScreen();
        updateHomeButtons();
      }, 500);
    });

    // ボタンをコンテナに追加
    buttonContainer.appendChild(retryBtn);
    buttonContainer.appendChild(backToTitleBtn);

    // 要素を組み立て
    imageContainer.appendChild(gameOverImg);
    imageContainer.appendChild(buttonContainer);
    overlay.appendChild(imageContainer);

    // ボディに追加
    document.body.appendChild(overlay);

    // アニメーション開始
    setTimeout(() => {
      overlay.classList.add("show");
    }, 50);

    // 2秒後にボタンを表示
    setTimeout(() => {
      buttonContainer.classList.add("show-button");
    }, 2000);
  }

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // --- Start Game ---
  startGame();
});
