// Prebuilt API v1 module. Hires BraveBrand employees into the selected
// community. The member's BraveBrand access link (their tier on
// home.bravebrand.com) decides which employees they can hire; each card is
// read live from that link, so a hire always gets the current card.
export const inject = ["react", "pages", "agents", "host"];

const HOME = "https://home.bravebrand.com";
const LINK = /^https:\/\/home\.bravebrand\.com\/([0-9a-f]{24})\/?/;
const STORE = "bravebrand.hire.tier";
// Pack slug on the host, and its public avatar.
const PACKS = [
  ["architect", "architect-avatar-v3.png"],
  ["brand-intelligence", "brand-strategist-avatar-v3.png"],
  ["copy-coach", "copy-writer-avatar-v3.png"],
  ["content-manager", "content-manager-avatar-v3.png"],
  ["funnel-builder", "funnel-builder-avatar-v3.png"],
  ["blaze", "blaze-avatar.png"],
];

export function apply(ctx) {
  const React = ctx.react;
  const h = React.createElement;
  const agents = ctx.agents;
  const host = ctx.host;

  const json = async (url) => {
    const response = await host.request({ url, method: "GET" });
    if (response.status === 404) return undefined;
    if (response.status < 200 || response.status >= 300)
      throw new Error(`${url} answered ${response.status}`);
    // Files outside the member's tier come back as the site's HTML page.
    try {
      return JSON.parse(response.body);
    } catch {
      return undefined;
    }
  };
  const roster = async (tier) => {
    const membership = await json(`${HOME}/${tier}/membership.json`);
    if (!membership) throw new Error("That access link isn't recognised.");
    const found = await Promise.all(
      PACKS.map(async ([pack, art]) => {
        const manifest = await json(`${HOME}/${tier}/${pack}/manifest.json`);
        if (!manifest) return undefined;
        const card = await json(`${HOME}/${tier}/${pack}/${manifest.card}`);
        const definition = card && card.definition;
        if (!definition || !definition.systemPrompt)
          return {
            pack,
            name: manifest.display,
            about: "",
            picture: `${HOME}/art/${art}`,
            version: manifest.version,
            locked: true,
          };
        return {
          pack,
          name: definition.name,
          about: (card.profile && card.profile.about) || "",
          picture: `${HOME}/art/${art}`,
          version: manifest.version,
          instructions: definition.systemPrompt,
        };
      }),
    );
    return { tier: membership.tier, employees: found.filter(Boolean) };
  };

  ctx.pages.register({
    id: "main",
    title: "BraveBrand Team",
    primary: true,
    component: function Team() {
      const [tier, setTier] = React.useState(() => localStorage.getItem(STORE) || "");
      const [link, setLink] = React.useState("");
      const [data, setData] = React.useState();
      const [error, setError] = React.useState("");
      const [busy, setBusy] = React.useState("");
      const [snap, setSnap] = React.useState(() => agents.snapshot());
      React.useEffect(() => agents.subscribe(() => setSnap(agents.snapshot())), []);
      React.useEffect(() => {
        if (!tier) return;
        let live = true;
        setError("");
        roster(tier).then(
          (next) => live && setData(next),
          (reason) => live && setError(String(reason.message || reason)),
        );
        return () => {
          live = false;
        };
      }, [tier]);
      const types = agents.types().filter((type) => !type.remote);
      const [typeKey, setTypeKey] = React.useState("");
      const chosen =
        types.find((type) => type.key === typeKey) ||
        types.find((type) => /claude/i.test(type.title)) ||
        types[0];
      const hired = (name) => snap.agents.some((agent) => agent.name === name);
      const hire = async (employee) => {
        if (!chosen || busy) return;
        setBusy(employee.pack);
        setError("");
        try {
          await agents.port({
            source: "shared",
            type: chosen.key,
            name: employee.name,
            picture: employee.picture,
            instructions: employee.instructions,
          });
        } catch (reason) {
          setError(`${employee.name}: ${String(reason.message || reason)}`);
        } finally {
          setBusy("");
        }
      };
      const save = () => {
        const match = LINK.exec(link.trim());
        if (!match) return setError("Paste the full link from your BraveBrand membership.");
        localStorage.setItem(STORE, match[1]);
        setLink("");
        setTier(match[1]);
      };
      const card = { className: "ui-card", style: { padding: "var(--space-panel-inset)", maxWidth: 820 } };
      if (!tier)
        return h("section", card,
          h("h1", null, "BraveBrand Team"),
          h("p", null, "Paste the access link from your BraveBrand membership to see who you can hire."),
          h("input", { value: link, onChange: (e) => setLink(e.target.value), placeholder: "Paste your link here: https://home.bravebrand.com/…", autoFocus: true, style: { width: "100%", boxSizing: "border-box", padding: "10px 12px", border: "1px solid currentColor", borderRadius: 8, font: "inherit", background: "transparent", color: "inherit" } }),
          h("p", null, h("button", { type: "button", onClick: save }, "Unlock my team")),
          error && h("p", { role: "alert" }, error));
      return h("section", card,
        h("h1", null, "BraveBrand Team"),
        h("p", null, data ? `Membership: ${data.tier}. Employees join this community.` : "Loading your team…"),
        types.length > 1 && h("p", null, "Run them with: ",
          h("select", { value: chosen ? chosen.key : "", onChange: (e) => setTypeKey(e.target.value) },
            types.map((type) => h("option", { key: type.key, value: type.key }, type.title)))),
        !types.length && h("p", null, "Switch on an agent type (such as Claude) in Settings first."),
        error && h("p", { role: "alert" }, error),
        data && h("div", { style: { display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" } },
          data.employees.map((employee) =>
            h("article", { key: employee.pack, className: "ui-card", style: { padding: 16 } },
              h("img", { src: employee.picture, alt: "", width: 72, height: 72, style: { borderRadius: "50%" } }),
              h("h3", null, employee.name),
              h("p", null, employee.about),
              h("p", { style: { opacity: 0.6, fontSize: 12 } }, `Version ${employee.version}`),
              employee.locked
                ? h("p", null, "Included with Premium")
                : hired(employee.name)
                ? h("p", null, "On your team")
                : h("button", { type: "button", disabled: !chosen || !!busy, onClick: () => hire(employee) },
                    busy === employee.pack ? "Hiring…" : "Hire")))),
        h("p", null, h("button", { type: "button", onClick: () => { localStorage.removeItem(STORE); setData(undefined); setTier(""); } }, "Use a different access link")));
    },
  });
}
