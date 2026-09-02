CREATE TABLE source (
    source_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    base_url TEXT NOT NULL,

    last_synced_at TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE tag (
    tag_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE category (
    category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE article (
    article_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID NOT NULL REFERENCES source(source_id),
    external_id TEXT NOT NULL,
    
    title TEXT NOT NULL,
    content_html TEXT NOT NULL,
    canonical_url TEXT NOT NULL,
    language TEXT,
    word_count INTEGER NOT NULL CHECK (word_count >= 0),

    published_at TIMESTAMP WITH TIME ZONE NOT NULL,
    source_updated_at TIMESTAMP WITH TIME ZONE NOT NULL,

    raw_payload TEXT NOT NULL,

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    UNIQUE (source_id, external_id)
);

CREATE TABLE article_tag (
    article_id UUID NOT NULL REFERENCES article(article_id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tag(tag_id) ON DELETE CASCADE,
    PRIMARY KEY (article_id, tag_id)
);

CREATE TABLE article_category (
    article_id UUID NOT NULL REFERENCES article(article_id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES category(category_id) ON DELETE CASCADE,
    PRIMARY KEY (article_id, category_id)
);

CREATE TABLE app_user (
    app_user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    locale TEXT,
    timezone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TYPE article_interest AS ENUM ('interested', 'not_interested');

CREATE TABLE user_article_interest (
    app_user_id UUID NOT NULL REFERENCES app_user(app_user_id) ON DELETE CASCADE,
    article_id UUID NOT NULL REFERENCES article(article_id) ON DELETE CASCADE,
    interest article_interest NOT NULL,

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    PRIMARY KEY (app_user_id, article_id)
);

CREATE TYPE article_interaction_type AS ENUM ('open');

CREATE TABLE article_interaction (
    article_interaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_user_id UUID NOT NULL REFERENCES app_user(app_user_id) ON DELETE CASCADE,
    article_id UUID NOT NULL REFERENCES article(article_id) ON DELETE CASCADE,
    type article_interaction_type NOT NULL,

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX article_published_at_article_id_idx ON article (published_at, article_id);
