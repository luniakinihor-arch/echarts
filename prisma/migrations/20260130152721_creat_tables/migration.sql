-- CreateTable
CREATE TABLE "requests" (
    "id" TEXT NOT NULL,
    "input_text" TEXT NOT NULL,
    "chart_type" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "request_steps" (
    "id" TEXT NOT NULL,
    "step_name" TEXT NOT NULL,
    "prompt" TEXT,
    "response" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "request_id" TEXT NOT NULL,

    CONSTRAINT "request_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "results" (
    "id" TEXT NOT NULL,
    "request_id" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "echarts_config" JSONB,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "requests_created_at_idx" ON "requests"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "results_request_id_key" ON "results"("request_id");

-- AddForeignKey
ALTER TABLE "request_steps" ADD CONSTRAINT "request_steps_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "results" ADD CONSTRAINT "results_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
