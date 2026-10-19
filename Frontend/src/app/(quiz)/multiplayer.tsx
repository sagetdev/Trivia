import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { api, type RoomSnapshot } from "../../lib/api";
import { getPlayerName } from "../../lib/player";
import { colors } from "../../theme";
import { Button, Card, IconButton, OptionCard, Text } from "../../components/ui";

export default function MultiplayerScreen() {
  const router = useRouter();
  const [name, setName] = useState("Player");
  const [codeInput, setCodeInput] = useState("");
  const [room, setRoom] = useState<RoomSnapshot | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { getPlayerName().then(setName).catch(() => {}); }, []);
  const sync = useCallback(async () => {
    if (!room || !playerId) return;
    try { setRoom(await api.getRoom(room.code, playerId)); } catch (e) {
      setError(e instanceof Error ? e.message : "Impossible de synchroniser la salle.");
    }
  }, [room?.code, playerId]);

  useEffect(() => {
    if (!room || !playerId || room.status === "finished") return;
    const timer = setInterval(() => { api.getRoom(room.code, playerId).then(setRoom).catch(() => {}); }, 1800);
    return () => clearInterval(timer);
  }, [room?.code, room?.status, playerId]);

  const run = async (action: () => Promise<RoomSnapshot>) => {
    setLoading(true); setError(null);
    try { const next = await action(); setRoom(next); if (next.playerId) setPlayerId(next.playerId); setSelected(null); }
    catch (e) { setError(e instanceof Error ? e.message : "Une erreur est survenue."); }
    finally { setLoading(false); }
  };

  const create = () => run(() => api.createRoom({ playerName: name, amount: 10, difficulty: "medium", timePerQuestion: 30 }));
  const join = () => run(() => api.joinRoom(codeInput.trim().toUpperCase(), name));
  const start = () => playerId && room ? run(() => api.startRoom(room.code, playerId)) : undefined;
  const answer = async () => {
    if (!room?.question || !playerId || !selected) return;
    setLoading(true); setError(null);
    try {
      const result = await api.submitRoomAnswer(room.code, playerId, selected, room.currentIndex);
      setRoom(result.room); setSelected(null);
    } catch (e) { setError(e instanceof Error ? e.message : "Impossible d'envoyer la réponse."); }
    finally { setLoading(false); }
  };

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ flex: 1, padding: 20, gap: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <IconButton icon="chevron-left" label="Back" onPress={() => router.back()} />
          <Text size={26} weight="bold">Play with friends</Text>
        </View>
        {!room && <>
          <Text size={14} color={colors.textMuted}>Create a room and share the code, or join a friend's room. Up to 8 players.</Text>
          <Card radius={16} style={{ padding: 16, gap: 10 }}>
            <Text size={15} weight="semibold">Your name</Text>
            <TextInput value={name} onChangeText={setName} maxLength={24} placeholder="Player name" placeholderTextColor={colors.textFaint} style={{ backgroundColor: colors.surface, color: colors.text, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12 }} />
            <Button label="Create room" onPress={create} disabled={!name.trim() || loading} />
          </Card>
          <Card radius={16} style={{ padding: 16, gap: 10 }}>
            <Text size={15} weight="semibold">Join a room</Text>
            <TextInput value={codeInput} onChangeText={(value) => setCodeInput(value.toUpperCase().slice(0, 6))} autoCapitalize="characters" maxLength={6} placeholder="6-character code" placeholderTextColor={colors.textFaint} style={{ backgroundColor: colors.surface, color: colors.text, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, letterSpacing: 2 }} />
            <Button label="Join room" variant="secondary" onPress={join} disabled={codeInput.trim().length < 6 || !name.trim() || loading} />
          </Card>
        </>}
        {room && <>
          <Card radius={18} style={{ padding: 18, gap: 10, alignItems: "center" }}>
            <Text size={13} color={colors.textMuted}>ROOM CODE</Text>
            <Text size={32} weight="bold">{room.code}</Text>
            <Text size={13} color={colors.textMuted}>{room.status === "waiting" ? "Waiting for players…" : room.status === "playing" ? `Question ${Math.min(room.currentIndex + 1, room.totalQuestions)} of ${room.totalQuestions}` : "Game finished"}</Text>
            <Text size={12} color={colors.textMuted}>Share this code with your friends</Text>
          </Card>
          <Text size={18} weight="semibold">Players ({room.players.length}/8)</Text>
          {room.players.map((player) => <Card key={player.id} radius={12} style={{ padding: 12, flexDirection: "row", justifyContent: "space-between" }}>
            <Text size={15}>{player.name}{player.id === playerId ? " (you)" : ""}</Text>
            <Text size={14} weight="semibold">{room.status === "waiting" ? "Ready" : `${player.score} pts`}</Text>
          </Card>)}
          {room.status === "waiting" && room.players[0]?.id === playerId && <Button label="Start game (minimum 2 players)" onPress={start} disabled={room.players.length < 2 || loading} />}
          {room.status === "playing" && room.question && <>
            <Text size={19} weight="semibold">{room.question.question}</Text>
            {room.question.answers.map((option, index) => <OptionCard key={option} letter={String.fromCharCode(65 + index)} label={option} state={selected === option ? "selected" : "default"} disabled={loading} onPress={() => setSelected(option)} />)}
            <Button label="Submit answer" onPress={answer} disabled={!selected || loading} />
            <Text size={12} color={colors.textMuted}>The next question appears when everyone has answered.</Text>
          </>}
          {room.status === "finished" && <>
            <Text size={20} weight="bold">Final ranking</Text>
            {room.players.slice().sort((a, b) => b.score - a.score).map((player, index) => <Card key={player.id} radius={12} style={{ padding: 12, flexDirection: "row", justifyContent: "space-between" }}>
              <Text size={14}>{index + 1}. {player.name}</Text><Text size={14} weight="semibold">{player.score}/{room.totalQuestions}</Text>
            </Card>)}
            <Button label="Back to home" onPress={() => router.replace("/home")} />
          </>}
          {room.status !== "finished" && <Button label="Leave room" variant="ghost" onPress={() => { setRoom(null); setPlayerId(null); setSelected(null); }} />}
        </>}
        {loading && <ActivityIndicator color={colors.primary} />}
        {error && <Text size={14} color={colors.error}>{error}</Text>}
      </View>
    </SafeAreaView>
  );
}
