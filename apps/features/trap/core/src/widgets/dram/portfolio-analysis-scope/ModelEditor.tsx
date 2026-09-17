import { Button, Divider, Input, Modal, Select, SelectProps, Radio, RadioChangeEvent } from 'antd';
import { DeleteOutlined, PlusOutlined, ThunderboltOutlined, UploadOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { CheckboxGroupProps } from 'antd/es/checkbox';

import styles from './ModelEditor.module.scss';
import { Model, Portfolio, Security } from './types';

interface ModelEditorProps {
  portfolios: Portfolio[]
}

const ModelEditor = ({
  portfolios
}: ModelEditorProps) => {
  const [newModel, setNewModel] = useState<Model>(
    { name: '', securities: []}
  );
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [weightCategory, setWeightCategory] = useState<string>("equalWeight");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [targetSum, setTargetSum] = useState<number>(0.00);

  const weightCategoryOptions: CheckboxGroupProps<string>['options'] = [
    { label: 'Equal-weight', value: 'equalWeight' },
    { label: 'Cap-weight', value: 'capWeight' }
  ];

  const onCancel = () => {
    setIsModalOpen(false);
  }

  const onCreateModel = () => {
    setIsModalOpen(false);
  }

  const handleModelNameChange = (value: string) => {
    if(!selectedModel) return;
    
    const updatedModel: Model = {
      ...selectedModel,
      name: value
    };

    setSelectedModel(updatedModel);

    if(updatedModel.id !== undefined) {
      setModels(prev => prev.map(model =>
        model.id === updatedModel.id ? updatedModel : model
      ));
    } else  {
      setNewModel(updatedModel);
    }
  }

  const uniqueBenchMarks = Array.from(new Map(
    portfolios
      .filter(portfolio => portfolio.benchmarkName && portfolio.benchmarkCode)
      .map(portfolio => [portfolio.benchmarkCode, {label: portfolio.benchmarkName, value: portfolio.benchmarkCode}])
    ).values()
  );

  const uniqueportfolios = Array.from(new Map(
    portfolios
    .filter(portfolio => portfolio.portfolioName && portfolio.portfolioNumber)
    .map(portfolio => [portfolio.portfolioNumber, {label: portfolio.portfolioName, value: portfolio.portfolioNumber}])
    ).values()
  );

  const weightsOptions: SelectProps['options'] = [
    {
      label: "S&P Indices",
      options: uniqueBenchMarks
    },
    {
      label: "Portfolios",
      options: uniqueportfolios
    }
  ]

  const securityCategoryOptions: SelectProps['options'] = [
    {
      label: "S&P 500",
      value: "snp"
    },
    {
      label: "MSCI World",
      value: "msci"
    },
    {
      label: "All Securities",
      value: "all"
    }
  ]

  const securityOptions: SelectProps['options'] = [
    {
      label: "MSFT - Microsoft",
      value: "MSFT"
    },
    {
      label: "APPL - Apple",
      value: "AAPL"
    },
  ]

  const handleSecurityCountChange = (value: string) => {
    console.log("value", value);
  }

  const handleGenerate = () => {

  }

  const handleWeightOptionsChange = (value: string) => {
    console.log("value", value);
    setNewModel(prev => {
      if(!prev) {
        return prev;
      }
      return {
        ...prev,
        securities: [
          {name: "Microsoft", code: "MSFT" },
          {name: "Apple", code: "AAPL" }
        ]
      }
    })
  }

  const onRemoveSecurity = () => {

  }

  const handleAddSecurity = (value: string) => {
    console.log("value", value);
    setNewModel(prev => {
      if(!prev) {
        return prev;
      }
      return {
        ...prev,
        securities: [
          {name: value, code: value }
        ]
      }
    })
  }

  const handleNormalizeTarget = () => {
    setTargetSum(100);
  }

  return (<>
    <div className={styles.modelsInfo}>
      <Divider />
      <div className={styles.modelsHeader}>
        <span className={styles.groupCnt}>Models {!newModel ? models.length : models.length + 1}</span>
        <Button type='primary' onClick={() => setIsModalOpen(true)}><PlusOutlined />New Model</Button>
      </div>
      <div className={styles.modelsList}>

      </div>

      <Modal
        title="New model"
        centered
        width={1000}
        closable={{ 'aria-label': 'Custom Close Button' }}
        open={isModalOpen}
        footer={
          <div className={styles.footer}>
            <div className={styles.targetInfo}>
              <span className={styles.targetLabel}>Σ {targetSum.toFixed(2)}%</span>
              <Button onClick={() => handleNormalizeTarget()}>Normalize to 100</Button>
            </div>
            <div className={styles.actionBtns}>
              <Button onClick={onCancel}>Cancel</Button>
              <Button type='primary' variant='filled' onClick={onCreateModel}>Create model</Button>
            </div>
          </div>
        }
      >
        <div className={styles.content}>
          <Divider />
          <div className={styles.nameSection}>
            <div className={styles.title}>Name</div>
            <Input
              autoFocus
              placeholder='e.g. Target — Overweight Semis'
              value={selectedModel?.name ?? ""}
              onChange={(e) => handleModelNameChange(e.target.value)}
            />
          </div>

          <div className={styles.weightsSection}>
            <div className={styles.title}>Prefill Weights</div>
            <div>
              <Select
                style={{width: 200}}
                allowClear
                placeholder="Please select"
                onChange={(value: string) => {handleWeightOptionsChange(value)}}
                options={weightsOptions}
              />
            </div>
            <div className={styles.config}>
              <div className="miniseg">
                <Radio.Group
                  options={weightCategoryOptions}
                  defaultValue={weightCategory}
                  optionType="button"
                  buttonStyle="solid"
                  onChange={(e: RadioChangeEvent) => setWeightCategory(e.target.value)}
                />
              </div>
              <span>top</span>
              <div>
                <Input
                  defaultValue={15}
                  type='number'
                  onChange={(e) => handleSecurityCountChange(e.target.value)}
                />
              </div>
              <span>of</span>
              <Select
                style={{width: 200}}
                allowClear
                placeholder="Please select"
                options={securityCategoryOptions}
              />
              <div>
                <Button onClick={handleGenerate}>
                  <ThunderboltOutlined />Generate
                </Button>
              </div>
            </div>
            <div>
              <Button
              >
                <UploadOutlined /> Upload CSV / Excel
              </Button>
            </div>
          </div>

          <div className={styles.securitySection}>
            <div className={styles.title}>
              <span>Security</span>
              <span>Target %</span>
            </div>
            <Divider style={{margin: "2px 0"}} />

            {(!models.length && newModel?.securities?.length <= 0) && <>
              <div>
                No holdings yet — prefill above, or add securities below.
              </div>
            </>}

            {newModel?.securities?.length > 0 && <>
              {newModel.securities.map((sec: Security) => (
                <div key={sec.code}>
                  <div className={styles.secDetailSection}>
                    <div className={styles.labelInfo}>
                      <span>{sec.name}</span>
                      <span>{sec.code}</span>
                    </div>
                    <div className={styles.actionInfo}>
                      <Input
                        defaultValue={15}
                        type='number'
                        value={selectedModel?.name ?? ""}
                        onChange={(e) => handleSecurityCountChange(e.target.value)}
                      />
                      <Button title="Remove" onClick={() => onRemoveSecurity()}>
                        <DeleteOutlined />
                      </Button>
                    </div>
                  </div>
                  <Divider style={{margin: "2px 0"}}/>
                </div>
              ))}

              <div>
                <PlusOutlined />
                <Select
                  style={{width: 200}}
                  allowClear
                  placeholder="Please select"
                  onChange={(value: string) => {handleAddSecurity(value)}}
                  options={securityOptions}
                />
              </div>
            </>}
          </div>
        </div>
      </Modal>
    </div>
  </>)
}

export default ModelEditor;