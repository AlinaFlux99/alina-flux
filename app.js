/* ---- PATCH: clickable card + clean links + CTA alignment ---- */

.tool-card.tool-card-link{
  display:block;
  text-decoration:none !important;
  color: inherit !important;
}

.tool-card.tool-card-link:visited{
  color: inherit !important;
}

.tool-top{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  margin-bottom:10px;
}

.tool-meta{
  display:flex;
  align-items:center;
  gap:10px;
  flex-wrap:wrap;
}

.tool-title{
  margin: 0 0 6px;
}

.cta{
  flex: 0 0 auto;
  padding: 10px 14px;
  border-radius: 12px;
  font-weight: 800;
  font-size: 14px;
  background: linear-gradient(135deg, #ff4fa3, #ff77c8);
  color:#fff;
  box-shadow: 0 10px 20px rgba(255, 79, 163, 0.22);
}

.tool-card:hover .cta{
  transform: translateY(-1px);
}

#searchInput.glow-on{
  border-color: rgba(255, 79, 163, 0.55) !important;
  box-shadow: 0 12px 28px rgba(255, 79, 163, 0.18) !important;
}
