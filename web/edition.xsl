<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:t="http://www.tei-c.org/ns/1.0"
    exclude-result-prefixes="t">
  <xsl:output method="html" encoding="UTF-8"/>

  <xsl:template match="/t:TEI">
    <div class="edition-body">
      <section id="about" class="about">
        <h2>Über diese Edition</h2>
        <xsl:apply-templates select="t:teiHeader"/>
      </section>
      <xsl:apply-templates select="t:text/t:body/*"/>
    </div>
  </xsl:template>

  <!-- Header: nur die fuer Leser relevanten Teile -->
  <xsl:template match="t:teiHeader">
    <dl>
      <dt>Titel</dt>
      <dd><xsl:value-of select="t:fileDesc/t:titleStmt/t:title"/></dd>
      <dt>Autor</dt>
      <dd><xsl:value-of select="t:fileDesc/t:titleStmt/t:author"/></dd>
      <dt>Herausgeber</dt>
      <dd><xsl:value-of select="normalize-space(t:fileDesc/t:titleStmt/t:editor)"/></dd>
      <dt>Handschrift</dt>
      <dd>
        <xsl:value-of select="t:fileDesc/t:sourceDesc/t:msDesc/t:msIdentifier/t:repository"/>
        <xsl:text>, </xsl:text>
        <xsl:value-of select="t:fileDesc/t:sourceDesc/t:msDesc/t:msIdentifier/t:idno"/>
        <xsl:text> (</xsl:text>
        <xsl:value-of select="t:fileDesc/t:sourceDesc/t:msDesc/t:msIdentifier/t:altIdentifier/t:idno"/>
        <xsl:text>)</xsl:text>
      </dd>
      <dt>Lizenz</dt>
      <dd>
        <a href="{t:fileDesc/t:publicationStmt/t:availability/t:licence/@target}">
          <xsl:text>CC BY 4.0</xsl:text>
        </a>
      </dd>
    </dl>
    <h3>Editionsprinzipien</h3>
    <p><xsl:apply-templates select="t:encodingDesc/t:editorialDecl/t:p/node()" mode="plain"/></p>
  </xsl:template>

  <xsl:template match="t:gi" mode="plain"><code><xsl:value-of select="."/></code></xsl:template>
  <xsl:template match="text()" mode="plain"><xsl:value-of select="."/></xsl:template>

  <!-- Struktur -->
  <xsl:template match="t:body/t:head">
    <h2 class="title"><xsl:apply-templates/></h2>
  </xsl:template>

  <xsl:template match="t:body/t:pb">
    <div class="pb pb-block" data-n="{@n}"></div>
  </xsl:template>

  <xsl:template match="t:body/t:ab">
    <div class="ab front"><xsl:apply-templates/></div>
  </xsl:template>

  <xsl:template match="t:div1">
    <xsl:variable name="nr" select="substring-after(@xml:id, 'thema')"/>
    <section class="letter" id="{@xml:id}" data-nr="{$nr}">
      <header class="letter-head">
        <h2><a href="#{@xml:id}">Θεματοεπιστολή <xsl:value-of select="$nr"/></a></h2>
        <xsl:if test="t:ab[not(t:add/@place = 'left')]">
          <span class="marg">
            <xsl:apply-templates select="t:ab[not(t:add/@place = 'left')]/node()"/>
          </span>
        </xsl:if>
      </header>
      <div class="versions">
        <xsl:apply-templates select="t:div2"/>
      </div>
    </section>
  </xsl:template>

  <xsl:template match="t:div2">
    <article class="version {@type}" lang="{@xml:lang}" id="{@xml:id}">
      <h3 class="vlabel">
        <xsl:value-of select="@type"/>
      </h3>
      <xsl:apply-templates/>
    </article>
  </xsl:template>

  <xsl:template match="t:div2/t:ab">
    <div class="ab"><xsl:apply-templates/></div>
  </xsl:template>

  <!-- Text -->
  <xsl:template match="t:s | t:seg">
    <span class="s" id="{@xml:id}"><xsl:apply-templates/></span>
  </xsl:template>

  <xsl:template match="t:lb">
    <span class="lb" data-n="{@n}"></span>
    <xsl:text> </xsl:text>
  </xsl:template>

  <xsl:template match="t:pb">
    <span class="pb" data-n="{@n}"></span>
  </xsl:template>

  <xsl:template match="t:expan">
    <span class="expan"><xsl:apply-templates/></span>
  </xsl:template>

  <xsl:template match="t:expan[@cert]">
    <span class="expan uncertain"><xsl:apply-templates/></span>
  </xsl:template>

  <xsl:template match="t:choice">
    <span class="choice"><xsl:apply-templates/></span>
  </xsl:template>

  <xsl:template match="t:abbr">
    <span class="abbr"><xsl:apply-templates/></span>
  </xsl:template>

  <xsl:template match="t:unclear">
    <span class="unclear"><xsl:apply-templates/></span>
  </xsl:template>

  <xsl:template match="t:del">
    <del class="del {@hand}"><xsl:apply-templates/></del>
  </xsl:template>

  <xsl:template match="t:add">
    <span class="add {@hand}">
      <xsl:if test="@place">
        <xsl:attribute name="data-place"><xsl:value-of select="@place"/></xsl:attribute>
        <xsl:attribute name="title">
          <xsl:text>Zusatz</xsl:text>
          <xsl:if test="@hand = 'Cr'"><xsl:text> von Crusius</xsl:text></xsl:if>
          <xsl:if test="@hand = 'Zyg'"><xsl:text> von Zygomalas</xsl:text></xsl:if>
          <xsl:text> (</xsl:text><xsl:value-of select="@place"/><xsl:text>)</xsl:text>
        </xsl:attribute>
      </xsl:if>
      <xsl:apply-templates/>
    </span>
  </xsl:template>

  <xsl:template match="t:hi">
    <span class="hi {@rend}"><xsl:apply-templates/></span>
  </xsl:template>

  <xsl:template match="t:space">
    <span class="space"></span>
  </xsl:template>

  <xsl:template match="t:c">
    <span class="c"><xsl:apply-templates/></span>
  </xsl:template>

  <xsl:template match="t:note">
    <span class="note"><xsl:apply-templates/></span>
  </xsl:template>

  <xsl:template match="t:ref">
    <a href="{@target}"><xsl:apply-templates/></a>
  </xsl:template>
</xsl:stylesheet>
