/* AEGIS Console: the dashboard is a working surface—actions lead, while current records and activity supply context. */

import { Link } from "wouter";
import { useAuth } from "../auth/AuthContext.jsx";
import { dashboardApi } from "../services/api.js";
import { useApiResource } from "../hooks/useApiResource.js";
import {
  LoadingState,
  ErrorState
} from "../components/AsyncState.jsx";
import { DocumentTable } from "../components/DocumentTable.jsx";
import { ActivityList } from "../components/ActivityList.jsx";
import { Icon } from "../components/Icon.jsx";

const greeting = () => {
  const hour = new Date().getHours();

  if (hour < 5) return "Good night";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";

  return "Good evening";
};

const valueOf = (data, ...keys) => {
  for (const key of keys) {
    if (
      data?.[key] !== undefined &&
      data?.[key] !== null
    ) {
      return data[key];
    }
  }

  return "—";
};

/*
 * Convert storage returned by the backend from bytes to KB.
 */
const formatStorage = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === "—"
  ) {
    return "—";
  }

  const bytes = Number(value);

  if (!Number.isFinite(bytes)) {
    return value;
  }

  const kb = bytes / 1024;

  return `${kb.toFixed(2)} KB`;
};

export function DashboardPage() {
  const { session } = useAuth();

  const resource = useApiResource(
    () =>
      dashboardApi.get(
        session.token,
        session.user.role
      ),
    [
      session.token,
      session.user.role
    ]
  );

  if (resource.status === "loading") {
    return (
      <LoadingState label="Preparing your workspace…" />
    );
  }

  if (resource.status === "error") {
    return (
      <ErrorState
        error={resource.error}
        onRetry={resource.reload}
        title="Your dashboard could not be loaded."
      />
    );
  }

  const data =
    resource.data?.data ||
    resource.data ||
    {};

  const stats =
    data.summary ||
    data.stats ||
    data.metrics ||
    {};

  const documents =
    data.recentDocuments ||
    data.documents ||
    [];

  const activity =
    data.recentActivity ||
    data.activity ||
    [];

  const categories =
    data.categories ||
    data.documentCategories ||
    [];

  const cards = [
    [
      "Total documents",
      valueOf(
        stats,
        "totalDocuments",
        "documents",
        "total"
      ),
      "folder"
    ],

    [
      "Recently added",
      valueOf(
        stats,
        "recentlyAdded",
        "addedRecently",
        "recent"
      ),
      "upload"
    ],

    [
      "Storage used",
      formatStorage(
        valueOf(
          stats,
          "storageUsed",
          "usedStorage",
          "storage"
        )
      ),
      "file"
    ],

    [
      "AI queries",
      valueOf(
        stats,
        "aiQueries",
        "queries",
        "ragQueries"
      ),
      "spark"
    ]
  ];

  return (
    <div className="page dashboard-page">

      <section className="page-intro dashboard-intro">
        <div>
          <span className="eyebrow">
            DOCUMENT CONTROL
          </span>

          <h1>
            {greeting()},{" "}
            <em>
              {session.user.name ||
                session.user.username}.
            </em>
          </h1>

          <p>
            Pick up the work that needs attention, or
            move directly into the documents you are
            authorized to manage.
          </p>
        </div>

        <div className="intro-index">
          {new Intl.DateTimeFormat(
            undefined,
            {
              month: "long",
              day: "numeric"
            }
          ).format(new Date())}

          <span>
            LIVE WORKSPACE
          </span>
        </div>
      </section>

      <section className="action-band">
        <div className="action-band-copy">
          <span className="eyebrow">
            START HERE
          </span>

          <h2>
            What are you working on?
          </h2>
        </div>

        <div className="action-band-links">

          <Link
            href="/assistant"
            className="primary-action"
          >
            <Icon
              name="spark"
              size={19}
            />

            <span>
              <strong>
                Ask AI
              </strong>

              <small>
                Search your authorized records
              </small>
            </span>

            <Icon
              name="arrow"
              size={18}
            />
          </Link>

          <Link
            href="/upload"
            className="secondary-action"
          >
            <Icon
              name="upload"
              size={18}
            />

            <span>
              Upload document
            </span>
          </Link>

          <Link
            href="/documents"
            className="secondary-action"
          >
            <Icon
              name="folder"
              size={18}
            />

            <span>
              View documents
            </span>
          </Link>

          <Link
            href="/my-documents"
            className="secondary-action"
          >
            <Icon
              name="file"
              size={18}
            />

            <span>
              My documents
            </span>
          </Link>

        </div>
      </section>

      <section className="summary-strip">

        {cards.map(
          ([label, value, icon]) => (
            <article
              className="summary-card"
              key={label}
            >
              <span className="summary-icon">
                <Icon
                  name={icon}
                  size={18}
                />
              </span>

              <div>
                <span>
                  {label}
                </span>

                <strong>
                  {value}
                </strong>
              </div>
            </article>
          )
        )}

      </section>

      <section className="dashboard-grid">

        <section className="content-panel recent-documents">

          <div className="panel-heading">

            <div>
              <span className="eyebrow">
                RECENTLY TOUCHED
              </span>

              <h2>
                Documents in motion
              </h2>
            </div>

            <Link
              href="/documents"
              className="text-link"
            >
              All documents{" "}
              <Icon
                name="arrow"
                size={15}
              />
            </Link>

          </div>

          <DocumentTable
            documents={documents}
            compact
          />

        </section>

        <aside className="dashboard-aside">

          <section className="content-panel categories-panel">

            <div className="panel-heading">

              <div>
                <span className="eyebrow">
                  FILE LANDSCAPE
                </span>

                <h2>
                  Categories
                </h2>
              </div>

            </div>

            {categories.length ? (
              <div className="category-list">

                {categories.map(
                  (category, index) => (
                    <div
                      className="category-item"
                      key={
                        category.type ||
                        category.name ||
                        index
                      }
                    >
                      <span
                        className="category-color"
                        style={{
                          "--category-index":
                            index
                        }}
                      />

                      <strong>
                        {category.name ||
                          category.type ||
                          category.extension}
                      </strong>

                      <span>
                        {category.count ??
                          category.total ??
                          "—"}
                      </span>
                    </div>
                  )
                )}

              </div>
            ) : (
              <p className="quiet-note">
                File categories will appear
                when the dashboard service
                provides them.
              </p>
            )}

          </section>

          <section className="content-panel activity-panel">

            <div className="panel-heading">

              <div>
                <span className="eyebrow">
                  AUDIT TRAIL
                </span>

                <h2>
                  Recent activity
                </h2>
              </div>

              <Link
                href="/activity"
                className="text-link"
              >
                Full activity{" "}
                <Icon
                  name="arrow"
                  size={15}
                />
              </Link>

            </div>

            <ActivityList
              items={activity.slice(0, 5)}
              compact
            />

          </section>

        </aside>

      </section>

    </div>
  );
}