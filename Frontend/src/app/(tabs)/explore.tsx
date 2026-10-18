import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { TextInput, View } from "react-native";
import { categories, Tag } from "../../components/data/mock";
import { CategoryCard } from "../../components/features";
import { Screen } from "../../components/Screen";
import { Chip, Icon, Text } from "../../components/ui";
import { colors, fonts } from "../../theme";

type Filter = "all" | Tag;

const filters: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "popular", label: "Popular" },
  { id: "new", label: "New" },
  { id: "trending", label: "Trending" },
];

export default function ExploreScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const results = useMemo(
    () =>
      categories.filter(
        (c) =>
          (filter === "all" || c.tags.includes(filter)) &&
          c.name.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [query, filter],
  );

  const rows: (typeof categories)[] = [];
  for (let i = 0; i < results.length; i += 2)
    rows.push(results.slice(i, i + 2));

  return (
    <Screen scroll>
      <Text size={28} weight="bold">
        Explore
      </Text>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          height: 50,
          paddingHorizontal: 17,
          borderRadius: 16,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <Icon name="search" size={20} color={colors.textFaint} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search topics"
          placeholderTextColor={colors.textFaint}
          style={{
            flex: 1,
            fontFamily: fonts.regular,
            fontSize: 15,
            color: colors.text,
          }}
        />
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {filters.map((f) => (
          <Chip
            key={f.id}
            label={f.label}
            active={filter === f.id}
            onPress={() => setFilter(f.id)}
          />
        ))}
      </View>

      <View style={{ gap: 12 }}>
        {rows.map((row, i) => (
          <View key={i} style={{ flexDirection: "row", gap: 12 }}>
            {row.map((c) => (
              <CategoryCard
                key={c.id}
                category={c}
                variant="large"
                onPress={() =>
                  router.push({
                    pathname: "/(quiz)/setup",
                    params: { category: c.id },
                  })
                }
              />
            ))}
            {row.length === 1 && <View style={{ flex: 1 }} />}
          </View>
        ))}
        {results.length === 0 && (
          <Text size={15} color={colors.textMuted} align="center">
            No topics found
          </Text>
        )}
      </View>
    </Screen>
  );
}
